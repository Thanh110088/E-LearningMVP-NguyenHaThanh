const express = require('express');
const workspaceController = require('./workspace.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const validBodyRequest = require('../../middlewares/validBodyRequest');
const { createWorkspaceSchema, updateWorkspaceSchema } = require('./workspace.schema');

const router = express.Router();

router.get('/', authenticate, authorize('TEACHER', 'ADMIN'), workspaceController.getMyWorkspaces);
router.post('/', authenticate, authorize('TEACHER', 'ADMIN'), validBodyRequest(createWorkspaceSchema), workspaceController.createWorkspace);
router.put('/:id', authenticate, authorize('TEACHER', 'ADMIN'), validBodyRequest(updateWorkspaceSchema), workspaceController.updateWorkspace);
router.delete('/:id', authenticate, authorize('TEACHER', 'ADMIN'), workspaceController.deleteWorkspace);

module.exports = router;
