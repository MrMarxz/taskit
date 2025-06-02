"use client";
import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  rectIntersection,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/trpc/react'; // Adjust import path as needed

// Type definitions based on Prisma models
interface Task {
  id: number;
  title: string;
  description: string | null;
  statusId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskStatus {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  Task: Task[];
}

interface DraggableCardProps {
  id: number;
  content: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

interface DroppableSectionProps {
  status: TaskStatus;
  isOver?: boolean;
  onCreateTask: (title: string, statusId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

// Draggable Card Component
function DraggableCard({ id, content, onEdit, onDelete }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleEdit = () => {
    onEdit(content);
  };

  const handleDelete = () => {
    onDelete(content);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:border-gray-300 transition-all duration-200 ease-out group
        ${isDragging ? 'rotate-3 scale-105 z-50' : 'hover:scale-102'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0" {...attributes} {...listeners}>
          <h3 className="font-medium text-gray-900 break-words">{content.title}</h3>
          {content.description && (
            <p className="text-gray-600 text-sm mt-1 break-words">{content.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Overlay Card Component (shown while dragging)
function DragOverlayCard({ content }: { content: Task }) {
  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-2xl rotate-3 scale-105 opacity-95">
      <h3 className="font-medium text-gray-900">{content.title}</h3>
      {content.description && (
        <p className="text-gray-600 text-sm mt-1">{content.description}</p>
      )}
    </div>
  );
}

// Edit Task Dialog Component
function EditTaskDialog({
  task,
  isOpen,
  onClose,
  onSave
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, title: string, description: string | null) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (title.trim()) {
      onSave(task.id, title.trim(), description.trim() || null);
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
            Make changes to your task here. All fields are automatically saved.
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
        </div>

        <DialogFooter className="px-8 py-6 bg-gray-50 border-t flex-row justify-end items-center">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} size="lg" className="h-11 px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
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
            This action cannot be undone. The task "{task.title}" will be permanently removed from your project.
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

// Create Task Card Component
function CreateTaskCard({ onCreateTask, statusId }: {
  onCreateTask: (title: string, statusId: number) => void;
  statusId: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask(title.trim(), statusId);
      setTitle('');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setTitle('');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!title.trim()) {
                setIsEditing(false);
              }
            }}
            placeholder="Enter task title..."
            className="w-full text-gray-900 font-medium bg-transparent border-none outline-none placeholder-gray-400 text-sm"
            autoFocus
          />
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full bg-gray-50 rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 flex items-center justify-start gap-2 group"
    >
      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-medium">Create</span>
    </button>
  );
}

// Droppable Section Component
function DroppableSection({ status, isOver, onCreateTask, onEditTask, onDeleteTask }: DroppableSectionProps) {
  const { setNodeRef } = useDroppable({
    id: status.id.toString(),
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-screen border-r border-gray-300 last:border-r-0 p-6 
        transition-all duration-200 ease-out
        ${isOver ? 'bg-blue-50 border-blue-300' : ''}
      `}
    >
      <h2 className="text-2xl font-semibold mb-4 text-slate-700">{status.name}</h2>
      {status.description && (
        <p className="text-gray-600 text-sm mb-4">{status.description}</p>
      )}

      <div
        className={`
          h-[calc(100vh-8rem)] rounded-lg border-2 border-dashed overflow-auto p-4
          transition-all duration-200 ease-out space-y-3
          ${isOver
            ? 'border-blue-400 bg-blue-50/50 scale-102'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
          }
        `}
      >
        <SortableContext
          items={status.Task.map(task => task.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {status.Task.length === 0 && (
            <div className={`
              flex items-center justify-center h-32 text-sm font-medium rounded-lg mb-3
              transition-all duration-200
              ${isOver
                ? 'text-blue-600 bg-blue-100/50'
                : 'text-gray-400 bg-gray-100/50'
              }
            `}>
              {isOver ? 'Drop here!' : 'Drop tasks here'}
            </div>
          )}

          {status.Task.map((task) => (
            <DraggableCard
              key={task.id}
              id={task.id}
              content={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Create new task card - as the last item in the list */}
        <CreateTaskCard onCreateTask={onCreateTask} statusId={status.id} />
      </div>
    </div>
  );
}

// Main Component
export default function DragDropSections() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // tRPC queries and utils
  const { data: taskStatuses, refetch: refetchStatuses } = api.task.getAllTaskStatuses.useQuery();
  const utils = api.useUtils();

  // tRPC mutations
  const createTaskMutation = api.task.createTask.useMutation({
    onSuccess: () => {
      refetchStatuses();
    },
  });

  const updateTaskMutation = api.task.updateTask.useMutation({
    onSuccess: () => {
      refetchStatuses();
    },
  });

  const deleteTaskMutation = api.task.deleteTask.useMutation({
    onSuccess: () => {
      refetchStatuses();
    },
  });

  const updateTaskStatusMutation = api.task.updateTaskStatus.useMutation({
    onError: () => {
      // If the mutation fails, refetch to restore correct state
      refetchStatuses();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to create a new task
  const createNewTask = async (title: string, statusId: number): Promise<void> => {
    try {
      await createTaskMutation.mutateAsync({
        title,
        description: null,
        statusId,
      });
      console.log(`Created new task "${title}" in status ${statusId}`);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

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
  const handleSaveTask = async (id: number, title: string, description: string | null) => {
    try {
      await updateTaskMutation.mutateAsync({
        id,
        title,
        description,
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

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const activeId = parseInt(active.id as string);

    // Find the active task across all statuses
    if (taskStatuses) {
      for (const status of taskStatuses) {
        const task = status.Task.find(t => t.id === activeId);
        if (task) {
          setActiveTask(task);
          break;
        }
      }
    }
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over || !taskStatuses) return;

    const activeTaskId = parseInt(active.id as string);
    const overId = over.id as string;

    // Find the current status of the dragged task
    let currentStatus: TaskStatus | undefined;
    let draggedTask: Task | undefined;

    for (const status of taskStatuses) {
      const task = status.Task.find(t => t.id === activeTaskId);
      if (task) {
        currentStatus = status;
        draggedTask = task;
        break;
      }
    }

    if (!currentStatus || !draggedTask) return;

    // Determine target status
    let targetStatusId: number;

    // Check if dropping directly on a status
    const directStatusMatch = taskStatuses.find(s => s.id.toString() === overId);
    if (directStatusMatch) {
      targetStatusId = directStatusMatch.id;
    } else {
      // Find status by task
      const targetStatus = taskStatuses.find(status =>
        status.Task.some(task => task.id.toString() === overId)
      );
      if (!targetStatus) return;
      targetStatusId = targetStatus.id;
    }

    // Only proceed if the status actually changed
    if (currentStatus.id === targetStatusId) return;

    // Update the cache optimistically
    utils.task.getAllTaskStatuses.setData(undefined, (oldData) => {
      if (!oldData) return oldData;

      return oldData.map(status => {
        if (status.id === currentStatus.id) {
          // Remove task from current status
          return {
            ...status,
            Task: status.Task.filter(task => task.id !== activeTaskId)
          };
        } else if (status.id === targetStatusId) {
          // Add task to target status
          return {
            ...status,
            Task: [...status.Task, { ...draggedTask, statusId: targetStatusId }]
          };
        }
        return status;
      });
    });

    // Then perform the actual mutation
    updateTaskStatusMutation.mutate({
      taskId: activeTaskId,
      statusId: targetStatusId,
    });

    console.log(`Moved task ${activeTaskId} from status ${currentStatus.id} to ${targetStatusId}`);
  };

  if (!taskStatuses) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {taskStatuses.map((status) => (
          <DroppableSection
            key={status.id}
            status={status}
            isOver={overId === status.id.toString()}
            onCreateTask={createNewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <DragOverlayCard content={activeTask} /> : null}
      </DragOverlay>

      <EditTaskDialog
        task={editingTask}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
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
    </DndContext>
  );
}