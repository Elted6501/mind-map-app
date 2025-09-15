// Security utilities for token management and XSS prevention

import { reportError } from './errorHandler';

// Secure token management using sessionStorage instead of localStorage
export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  
  // Set token with expiration (using sessionStorage)
  static setToken(token: string, expiryHours: number = 24): void {
    try {
      // Validate token format (basic JWT validation)
      if (!this.isValidJWT(token)) {
        throw new Error('Invalid token format');
      }
      
      const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000);
      
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      reportError(error as Error, { context: 'setToken' });
      throw error;
    }
  }
  
  // Get token if valid and not expired (from sessionStorage)
  static getToken(): string | null {
    try {
      const token = sessionStorage.getItem(this.TOKEN_KEY);
      const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() <= expiryTime) {
          return token;
        } else {
          // Token expired, clean up
          this.clearToken();
        }
      }
      
      return null;
    } catch (error) {
      reportError(error as Error, { context: 'getToken' });
      this.clearToken();
      return null;
    }
  }
  
  // Clear token and expiry (from sessionStorage)
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }
  
  // Check if token exists and is valid
  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
  
  // Basic JWT validation (checks structure, not signature)
  private static isValidJWT(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }
  
  // Check if token is close to expiring (within 1 hour)
  static isTokenExpiringSoon(): boolean {
    try {
      const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (!expiry) return false;
      
      const expiryTime = parseInt(expiry, 10);
      const oneHour = 60 * 60 * 1000;
      
      return Date.now() > (expiryTime - oneHour);
    } catch {
      return false;
    }
  }
}

// XSS Prevention utilities
export class XSSProtection {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(input: string): string {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }
    // Server-side fallback
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // Sanitize user input for display
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // Validate and sanitize URLs
  static sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid protocol');
      }
      
      return urlObj.toString();
    } catch {
      return '#';
    }
  }
  
  // Safe JSON parsing to prevent prototype pollution
  static safeJSONParse<T>(json: string): T | null {
    try {
      const parsed = JSON.parse(json);
      
      // Check for prototype pollution attempts
      if (this.hasProtoProperty(parsed)) {
        throw new Error('Potential prototype pollution detected');
      }
      
      return parsed;
    } catch (error) {
      reportError(error as Error, { context: 'safeJSONParse', json: json.substring(0, 100) });
      return null;
    }
  }
  
  // Check for dangerous property names
  private static hasProtoProperty(obj: unknown): boolean {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }
    
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    if (Array.isArray(obj)) {
      return obj.some(item => this.hasProtoProperty(item));
    }
    
    const objectKeys = Object.keys(obj);
    return dangerousKeys.some(key => objectKeys.includes(key)) ||
           Object.values(obj).some(value => this.hasProtoProperty(value));
  }
}

// Input validation utilities
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  // Password strength validation
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Sanitize mind map content
  static sanitizeMindMapContent(content: string): string {
    // Remove potentially dangerous content while preserving basic formatting
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 1000); // Limit content length
  }
}

// Rate limiting for client-side protection
export class RateLimiter {
  private static limits = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(action: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const limit = this.limits.get(action);
    
    if (!limit || now > limit.resetTime) {
      this.limits.set(action, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (limit.count >= maxRequests) {
      return false;
    }
    
    limit.count++;
    return true;
  }
  
  static resetLimit(action: string): void {
    this.limits.delete(action);
  }
}