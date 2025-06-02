"use client";
import { useState } from 'react';
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

// Type definitions
interface CardContent {
  id: string;
  title: string;
  description: string;
}

interface DraggableCardProps {
  id: string;
  content: CardContent;
}

interface DroppableSectionProps {
  id: SectionKey;
  title: string;
  items: CardContent[];
  isOver?: boolean;
  onCreateTask: (title: string) => void;
}

interface Sections {
  section1: CardContent[];
  section2: CardContent[];
  section3: CardContent[];
}

type SectionKey = keyof Sections;

// Draggable Card Component
function DraggableCard({ id, content }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      <p className="text-gray-600 text-sm mt-1">{content.description}</p>
    </div>
  );
}

// Overlay Card Component (shown while dragging)
function DragOverlayCard({ content }: { content: CardContent }) {
  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-2xl rotate-3 scale-105 opacity-95">
      <h3 className="font-medium text-gray-900">{content.title}</h3>
      <p className="text-gray-600 text-sm mt-1">{content.description}</p>
    </div>
  );
}

// Create Task Card Component
function CreateTaskCard({ onCreateTask }: { onCreateTask: (title: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask(title.trim());
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
      <div className="bg-white border-2 border-blue-300 rounded-lg p-3 shadow-sm">
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
      className="w-full bg-gray-50 rounded-lg p-3 text-gray-500 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-600 transition-all duration-200 flex items-center justify-start gap-2 group"
    >
      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-medium">Create</span>
    </button>
  );
}

// Droppable Section Component
function DroppableSection({ id, title, items, isOver, onCreateTask }: DroppableSectionProps) {
  const { setNodeRef } = useDroppable({
    id: id,
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
      <h2 className="text-2xl font-semibold mb-4 text-slate-700">{title}</h2>
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
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <DraggableCard key={item.id} id={item.id} content={item} />
          ))}
        </SortableContext>

        {/* Create new task card - as the last item in the list */}
        <CreateTaskCard onCreateTask={onCreateTask} />
      </div>
    </div>
  );
}

// Main Component
export default function DragDropSections() {
  const [sections, setSections] = useState<Sections>({
    section1: [
      { id: 'card-1', title: 'Task 1', description: 'This is the first task' },
      { id: 'card-2', title: 'Task 2', description: 'This is the second task' },
    ],
    section2: [
      { id: 'card-3', title: 'Task 3', description: 'This is the third task' },
    ],
    section3: [
      { id: 'card-4', title: 'Task 4', description: 'This is the fourth task' },
      { id: 'card-5', title: 'Task 5', description: 'This is the fifth task' },
    ],
  });

  const [activeCard, setActiveCard] = useState<CardContent | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

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

  // Function to create a new task in a specific section
  const createNewTask = (sectionId: SectionKey, title: string): void => {
    const newTask: CardContent = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      description: 'New task created'
    };

    setSections(prev => ({
      ...prev,
      [sectionId]: [...prev[sectionId], newTask]
    }));

    console.log(`Created new task "${title}" in ${sectionId}`);
  };

  // Custom functions to run when cards are moved to specific sections
  const onMoveToTodo = (item: CardContent, fromSection: string): void => {
    console.log(`Moving "${item.title}" back to Todo from ${fromSection}`);
  };

  const onMoveToInProgress = (item: CardContent, fromSection: string): void => {
    console.log(`Starting work on "${item.title}" from ${fromSection}`);
  };

  const onMoveToDone = (item: CardContent, fromSection: string): void => {
    console.log(`Completed "${item.title}" from ${fromSection}`);
  };

  const handleDragStart = (event: DragStartEvent): void => {
    const { active } = event;
    const activeId = active.id as string;

    const activeSection = (Object.keys(sections) as SectionKey[]).find(sectionId =>
      sections[sectionId].some(item => item.id === activeId)
    );

    if (activeSection) {
      const activeItem = sections[activeSection].find(item => item.id === activeId);
      setActiveCard(activeItem || null);
    }
  };

  const handleDragOver = (event: DragOverEvent): void => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    setActiveCard(null);
    setOverId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeSection = (Object.keys(sections) as SectionKey[]).find(sectionId =>
      sections[sectionId].some(item => item.id === activeId)
    );

    let overSection: SectionKey | undefined;

    if (['section1', 'section2', 'section3'].includes(overId)) {
      overSection = overId as SectionKey;
    } else {
      overSection = (Object.keys(sections) as SectionKey[]).find(sectionId =>
        sections[sectionId].some(item => item.id === overId)
      );
    }

    if (!activeSection || !overSection) return;

    const activeItem = sections[activeSection].find(item => item.id === activeId);
    if (!activeItem) return;

    if (activeSection === overSection) {
      if (overId !== activeId) {
        const activeIndex = sections[activeSection].findIndex(item => item.id === activeId);
        const overIndex = sections[overSection].findIndex(item => item.id === overId);

        if (activeIndex !== overIndex) {
          setSections(prev => ({
            ...prev,
            [activeSection]: arrayMove(prev[activeSection], activeIndex, overIndex),
          }));
        }
      }
    } else {
      setSections(prev => ({
        ...prev,
        [activeSection]: prev[activeSection].filter(item => item.id !== activeId),
        [overSection]: [...prev[overSection], activeItem],
      }));

      const sectionMap: Record<SectionKey, string> = {
        section1: 'Todo',
        section2: 'In Progress',
        section3: 'Done'
      };

      const fromSectionName = sectionMap[activeSection];

      switch (overSection) {
        case 'section1':
          onMoveToTodo(activeItem, fromSectionName);
          break;
        case 'section2':
          onMoveToInProgress(activeItem, fromSectionName);
          break;
        case 'section3':
          onMoveToDone(activeItem, fromSectionName);
          break;
        default:
          console.log(`Item moved to unknown section: ${overSection}`);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <DroppableSection
          id="section1"
          title="To Do"
          items={sections.section1}
          isOver={overId === 'section1'}
          onCreateTask={(title) => createNewTask('section1', title)}
        />
        <DroppableSection
          id="section2"
          title="In Progress"
          items={sections.section2}
          isOver={overId === 'section2'}
          onCreateTask={(title) => createNewTask('section2', title)}
        />
        <DroppableSection
          id="section3"
          title="Done"
          items={sections.section3}
          isOver={overId === 'section3'}
          onCreateTask={(title) => createNewTask('section3', title)}
        />
      </div>

      <DragOverlay>
        {activeCard ? <DragOverlayCard content={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}