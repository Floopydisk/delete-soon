import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

const validate = (schema: ZodSchema<unknown>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Preserve Zod coercions (for example Yes/No values converted to booleans)
      // so route handlers and Mongoose receive the validated representation.
      if (parsed && typeof parsed === 'object' && 'body' in parsed) {
        req.body = (parsed as { body: unknown }).body;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error.issues);
        const errorMessages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errorMessages,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
};

export default validate;
