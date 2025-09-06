const prisma = require('../config/database');
const path = require('path');
const fs = require('fs');

const uploadProjectFile = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: userId
      }
    });

    if (!membership) {
      // Clean up uploaded file if user doesn't have access
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        projectId: parseInt(projectId),
        uploadedBy: userId
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment: {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimetype: attachment.mimetype,
        size: attachment.size,
        projectId: attachment.projectId,
        uploadedBy: attachment.uploadedBy,
        createdAt: attachment.createdAt,
        uploader: attachment.uploader
      }
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

const uploadTaskFile = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if user has access to the task (through project membership)
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        project: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      }
    });

    if (!task) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        taskId: parseInt(taskId),
        projectId: task.projectId,
        uploadedBy: userId
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment: {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimetype: attachment.mimetype,
        size: attachment.size,
        taskId: attachment.taskId,
        uploadedBy: attachment.uploadedBy,
        createdAt: attachment.createdAt,
        uploader: attachment.uploader
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload task file error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

const getProjectFiles = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Check if user is project member
    const membership = await prisma.teamMembership.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attachments = await prisma.attachment.findMany({
      where: {
        projectId: parseInt(projectId)
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        },
        task: {
          select: { id: true, title: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    const totalFiles = await prisma.attachment.count({
      where: {
        projectId: parseInt(projectId)
      }
    });

    res.json({
      attachments: attachments.map(att => ({
        id: att.id,
        filename: att.filename,
        originalName: att.originalName,
        mimetype: att.mimetype,
        size: att.size,
        taskId: att.taskId,
        uploadedBy: att.uploadedBy,
        createdAt: att.createdAt,
        uploader: att.uploader,
        task: att.task
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalFiles,
        pages: Math.ceil(totalFiles / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get project files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id: attachmentId } = req.params;
    const userId = req.user.id;

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: parseInt(attachmentId),
        OR: [
          {
            project: {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          },
          {
            task: {
              project: {
                members: {
                  some: {
                    userId: userId
                  }
                }
              }
            }
          }
        ]
      }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    const filePath = attachment.path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimetype);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id: attachmentId } = req.params;
    const userId = req.user.id;

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: parseInt(attachmentId),
        uploadedBy: userId // Only uploader can delete
      }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // Delete file from disk
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: parseInt(attachmentId) }
    });

    res.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

module.exports = {
  uploadProjectFile,
  uploadTaskFile,
  getProjectFiles,
  downloadFile,
  deleteFile
};
