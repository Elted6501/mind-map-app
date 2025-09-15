/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MindMap } from '@/models/MindMap';
import { getAuthenticatedUser } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    
    // Connect to database
    await dbConnect();

    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Build search filter
    let searchFilter: any = {
      $or: [
        { userId: user._id },
        { 'collaborators': user._id }
      ]
    };

    // Add text search if query provided
    if (query.trim()) {
      const searchRegex = { $regex: query.trim(), $options: 'i' };
      searchFilter.$and = [
        searchFilter,
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { 'nodes.text': searchRegex },
            { tags: { $in: [searchRegex] } }
          ]
        }
      ];
      // Restructure to avoid conflict
      const ownerFilter = searchFilter.$or;
      delete searchFilter.$or;
      searchFilter = {
        $and: [
          { $or: ownerFilter },
          {
            $or: [
              { title: searchRegex },
              { description: searchRegex },
              { 'nodes.text': searchRegex },
              { tags: searchRegex }
            ]
          }
        ]
      };
    }

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search query
    const [mindMaps, total] = await Promise.all([
      MindMap.find(searchFilter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('title description createdAt updatedAt userId tags nodes')
        .populate('userId', 'username email')
        .lean(),
      MindMap.countDocuments(searchFilter)
    ]);

    // Add search relevance scoring for text queries
    let results = mindMaps;
    if (query.trim()) {
      results = mindMaps.map((mindMap: any) => {
        let score = 0;
        const queryLower = query.toLowerCase();
        
        // Title match (highest weight)
        if (mindMap.title?.toLowerCase().includes(queryLower)) {
          score += 10;
        }
        
        // Description match (medium weight)
        if (mindMap.description?.toLowerCase().includes(queryLower)) {
          score += 5;
        }
        
        // Node text matches (medium weight)
        if (mindMap.nodes) {
          const nodeMatches = mindMap.nodes.filter((node: any) => 
            node.text?.toLowerCase().includes(queryLower)
          ).length;
          score += nodeMatches * 3;
        }
        
        // Tag matches (low weight)
        if (mindMap.tags) {
          const tagMatches = mindMap.tags.filter((tag: string) => 
            tag.toLowerCase().includes(queryLower)
          ).length;
          score += tagMatches * 2;
        }

        return { ...mindMap, searchScore: score };
      }).sort((a: any, b: any) => b.searchScore - a.searchScore);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      mindMaps: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: total,
        limit,
        hasNextPage,
        hasPrevPage
      },
      query: {
        searchTerm: query,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && (
      error.message === 'No token provided' ||
      error.message === 'Invalid or expired token' ||
      error.message === 'User not found'
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to search mind maps' },
      { status: 500 }
    );
  }
}