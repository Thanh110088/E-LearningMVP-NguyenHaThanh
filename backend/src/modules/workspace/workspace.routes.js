const express = require('express');
const workspaceController = require('./workspace.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Workspace management (Requires authentication, TEACHER & ADMIN)
router.get('/', authenticate, authorize('TEACHER', 'ADMIN'), workspaceController.getMyWorkspaces);
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), workspaceController.createWorkspace);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), workspaceController.updateWorkspace);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), workspaceController.deleteWorkspace);

module.exports = router;
