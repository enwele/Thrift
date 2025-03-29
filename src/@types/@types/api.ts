export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
  }
  
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface AppError extends Error {
    statusCode?: number;
    validationErrors?: ValidationError[];
  }