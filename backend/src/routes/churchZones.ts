import express, {Router} from 'express';
import { ChurchZone } from '@/models';
import { authenticate, requireAdmin } from '@/middleware';
import validate from '@/middleware/validation';
import { createChurchZoneSchema, idParamSchema, paginationSchema } from '@/types/schemas';

const router: Router = express.Router();

// Get all church zones (public endpoint, no pagination)
router.get('/get-all-zones', async (req, res) => {
  try {
    const zones = await ChurchZone.find({}).sort({ zoneName: 1 });
    res.status(200).json({
      status: 'success',
      data: {
        zones
      }
    });
  } catch (error: unknown) {
    console.error('All church zones fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch all church zones',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get all church zones (public endpoint)
router.get('/', validate(paginationSchema), async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy) {
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.zoneName = 1; // Default sort by zone name
    }

    const [zones, totalCount] = await Promise.all([
      ChurchZone.find({})
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      ChurchZone.countDocuments({})
    ]);

    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      status: 'success',
      data: {
        zones,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          limit: Number(limit),
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (error: unknown) {
    console.error('Church zones fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch church zones',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create new church zone (Admin only)
router.post('/', authenticate, requireAdmin, validate(createChurchZoneSchema), async (req, res) => {
  try {
    const zone = new ChurchZone(req.body);
    await zone.save();

    res.status(201).json({
      status: 'success',
      message: 'Church zone created successfully',
      data: {
        zone
      }
    });

  } catch (error: any) {
    console.error('Church zone creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create church zone',
      error: error.message
    });
  }
});

// Get single church zone by ID
router.get('/:id', validate(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await ChurchZone.findById(id);
    if (!zone) {
      return res.status(404).json({
        status: 'error',
        message: 'Church zone not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        zone
      }
    });

  } catch (error: any) {
    console.error('Church zone fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch church zone',
      error: error.message
    });
  }
});

// Update church zone (Admin only)
router.put('/:id', authenticate, requireAdmin, validate(idParamSchema), validate(createChurchZoneSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await ChurchZone.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!zone) {
      return res.status(404).json({
        status: 'error',
        message: 'Church zone not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Church zone updated successfully',
      data: {
        zone
      }
    });

  } catch (error: any) {
    console.error('Church zone update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update church zone',
      error: error.message
    });
  }
});

// Delete church zone (Admin only)
router.delete('/:id', authenticate, requireAdmin, validate(idParamSchema), async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await ChurchZone.findByIdAndDelete(id);
    if (!zone) {
      return res.status(404).json({
        status: 'error',
        message: 'Church zone not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Church zone deleted successfully'
    });

  } catch (error: any) {
    console.error('Church zone deletion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete church zone',
      error: error.message
    });
  }
});

export default router;