"use client";
import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';

// Type definitions based on Prisma models
interface Task {
  id: number;
  title: string;
  description: string | null;
  statusId: number;
  createdAt: Date;
  updatedAt: Date;
  status: TaskStatus;
}

interface TaskStatus {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Edit Task Dialog Component
function EditTaskDialog({ 
  task, 
  isOpen, 
  onClose, 
  onSave,
  taskStatuses
}: { 
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, title: string, description: string | null, statusId: number) => void;
  taskStatuses: TaskStatus[];
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatusId(task.statusId.toString());
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (title.trim() && statusId) {
      onSave(task.id, title.trim(), description.trim() || null, parseInt(statusId));
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Edit Task
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Update task details and status here.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Task Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-lg border-2 focus:border-blue-500 transition-colors"
              placeholder="Enter your task title..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] text-base border-2 focus:border-blue-500 transition-colors resize-none"
              placeholder="Add a description for your task..."
              rows={5}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
              Status
            </Label>
            <Select value={statusId} onValueChange={setStatusId}>
              <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {taskStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-gray-50 border-t flex-row justify-end items-center">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} size="lg" className="h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!title.trim() || !statusId}
              size="lg" 
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog Component
function DeleteTaskDialog({ 
  task, 
  isOpen, 
  onClose, 
  onDelete 
}: { 
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  if (!task) return null;

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Delete this task?</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 mt-2">
            This action cannot be undone. The task &quot;{task.title}&quot; will be permanently removed from your project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 mt-6">
          <AlertDialogCancel className="h-11 px-6">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="h-11 px-6 bg-red-600 hover:bg-red-700"
          >
            Delete Task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Create Task Dialog Component
function CreateTaskDialog({ 
  isOpen, 
  onClose, 
  onCreate,
  taskStatuses
}: { 
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string | null, statusId: number) => void;
  taskStatuses: TaskStatus[];
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatusId(taskStatuses[0]?.id.toString() || '');
    }
  }, [isOpen, taskStatuses]);

  const handleCreate = () => {
    if (title.trim() && statusId) {
      onCreate(title.trim(), description.trim() || null, parseInt(statusId));
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Add a new task to your project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-8 py-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="new-title" className="text-sm font-semibold text-gray-700">
              Task Title
            </Label>
            <Input
              id="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 text-lg border-2 focus:border-green-500 transition-colors"
              placeholder="Enter your task title..."
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="new-description" className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <Textarea
              id="new-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] text-base border-2 focus:border-green-500 transition-colors resize-none"
              placeholder="Add a description for your task..."
              rows={5}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="new-status" className="text-sm font-semibold text-gray-700">
              Initial Status
            </Label>
            <Select value={statusId} onValueChange={setStatusId}>
              <SelectTrigger className="h-12 text-base border-2 focus:border-green-500">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {taskStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-gray-50 border-t flex-row justify-end items-center">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} size="lg" className="h-11 px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!title.trim() || !statusId}
              size="lg" 
              className="h-11 px-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            >
              Create Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get status color
function getStatusColor(statusName: string): string {
  const name = statusName.toLowerCase();
  if (name.includes('todo') || name.includes('backlog')) return 'bg-gray-100 text-gray-800';
  if (name.includes('progress') || name.includes('doing')) return 'bg-blue-100 text-blue-800';
  if (name.includes('done') || name.includes('complete')) return 'bg-green-100 text-green-800';
  if (name.includes('review')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

// Main Backlog Component
export default function BacklogPage() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // tRPC queries
  const { data: tasks, refetch: refetchTasks } = api.task.getAllTasks.useQuery();
  const { data: taskStatuses } = api.task.getAllTaskStatuses.useQuery();
  
  // tRPC mutations
  const updateTaskMutation = api.task.updateTask.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });
  
  const deleteTaskMutation = api.task.deleteTask.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  const createTaskMutation = api.task.createTask.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });

  // Function to handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  // Function to handle delete task
  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Function to save task changes
  const handleSaveTask = async (id: number, title: string, description: string | null, statusId: number) => {
    try {
      await updateTaskMutation.mutateAsync({
        id,
        title,
        description,
        statusId,
      });
      console.log(`Updated task ${id}`);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Function to confirm delete task
  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteTaskMutation.mutateAsync({ id });
      console.log(`Deleted task ${id}`);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Function to create new task
  const handleCreateTask = async (title: string, description: string | null, statusId: number) => {
    try {
      await createTaskMutation.mutateAsync({
        title,
        description,
        statusId,
      });
      console.log(`Created new task "${title}"`);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  if (!tasks || !taskStatuses) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Backlog</h1>
            <p className="text-gray-600 mt-2">Manage all your tasks in one place</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg"
            className="h-11 px-6 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Task Title</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Created</TableHead>
                <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                    No tasks found. Create your first task to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(task.status.name)}
                      >
                        {task.status.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                          className="h-8 px-3"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task)}
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Task Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Dialogs */}
      <EditTaskDialog
        task={editingTask}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        taskStatuses={taskStatuses}
      />

      <DeleteTaskDialog
        task={deletingTask}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingTask(null);
        }}
        onDelete={handleConfirmDelete}
      />

      <CreateTaskDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateTask}
        taskStatuses={taskStatuses}
      />
    </div>
  );
}