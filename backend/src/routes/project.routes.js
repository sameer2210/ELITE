import express from 'express';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controllers/project.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import upload from '../middleware/aws.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(getProjects)
  .post(protect, requireRole('developer', 'admin'),upload.single("image"), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(protect, requireRole('developer', 'admin'),upload.single("image"), updateProject)
  .patch(protect, requireRole('developer', 'admin'),upload.single("image"), updateProject)
  .delete(protect, requireRole('developer', 'admin'), deleteProject);

export default router;
