"use client";
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
import { api } from '@/trpc/react';

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
}

interface DroppableSectionProps {
  status: TaskStatus;
  isOver?: boolean;
  onCreateTask: (title: string, statusId: number) => void;
}

// Draggable Card Component
function DraggableCard({ id, content }: DraggableCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:border-gray-300 transition-all duration-200 ease-out
        ${isDragging ? 'rotate-3 scale-105 z-50' : 'hover:scale-102'}
      `}
    >
      <h3 className="font-medium text-gray-900">{content.title}</h3>
      {content.description && (
        <p className="text-gray-600 text-sm mt-1">{content.description}</p>
      )}
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
function DroppableSection({ status, isOver, onCreateTask }: DroppableSectionProps) {
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
            <DraggableCard key={task.id} id={task.id} content={task} />
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

  // tRPC queries and utils
  const { data: taskStatuses, refetch: refetchStatuses } = api.tasks.getAllTaskStatuses.useQuery();
  const utils = api.useUtils();
  
  // tRPC mutations with optimistic updates
  const createTaskMutation = api.tasks.createTask.useMutation({
    onSuccess: () => {
      refetchStatuses();
    },
  });
  
  const updateTaskStatusMutation = api.tasks.updateTaskStatus.useMutation({
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
    utils.tasks.getAllTaskStatuses.setData(undefined, (oldData) => {
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
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <DragOverlayCard content={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}