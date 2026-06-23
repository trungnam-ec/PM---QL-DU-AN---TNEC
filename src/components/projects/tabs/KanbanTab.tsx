"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Plus } from 'lucide-react';
import { useTasks, useUpdateTask } from '@/lib/hooks/useTasks';
import { Task } from '@/types/database';
import { Button } from '@/components/ui/button';
import { TaskFormDialog } from '@/components/projects/TaskFormDialog';
import { cn } from '@/lib/utils';

interface KanbanTabProps {
  projectId: string;
}

const COLUMNS = [
  { id: 'todo',        title: 'KẾ HOẠCH',     color: 'bg-purple-500', borderTop: 'border-t-purple-500',  bgHeader: 'bg-purple-50/50' },
  { id: 'in_progress', title: 'ĐANG XỬ LÝ',   color: 'bg-amber-400',  borderTop: 'border-t-amber-400',   bgHeader: 'bg-amber-50/50' },
  { id: 'in_review',   title: 'CHỜ DUYỆT',    color: 'bg-cyan-500',   borderTop: 'border-t-cyan-500',    bgHeader: 'bg-cyan-50/50' },
  { id: 'done',        title: 'HOÀN THÀNH',   color: 'bg-emerald-500',borderTop: 'border-t-emerald-500', bgHeader: 'bg-emerald-50/50' },
];

export function KanbanTab({ projectId }: KanbanTabProps) {
  const { data: dbTasks, isLoading } = useTasks(projectId);
  const updateTask = useUpdateTask();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('todo');

  useEffect(() => {
    if (dbTasks) setTasks(dbTasks);
  }, [dbTasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newTasks = Array.from(tasks);
    const idx = newTasks.findIndex((t) => t.id === draggableId);
    if (idx === -1) return;

    const movedTask = { ...newTasks[idx], status: destination.droppableId as Task['status'] };
    newTasks.splice(idx, 1);
    
    // Insert at new index
    const destTasks = newTasks.filter(t => t.status === destination.droppableId);
    destTasks.splice(destination.index, 0, movedTask);
    
    // Simplified state update for UI
    setTasks([...newTasks.filter(t => t.status !== destination.droppableId), ...destTasks]);

    updateTask.mutate({ id: draggableId, status: destination.droppableId as Task['status'] });
  };

  const handleAddInColumn = (colId: Task['status']) => {
    setDefaultStatus(colId);
    setIsAddOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex gap-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-80 shrink-0 bg-slate-50 rounded-2xl h-64 animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  // Helper to extract a priority color based on some text logic if priority existed. Defaulting to Neutral.
  const getPriorityTag = (title: string) => {
    if (title.toLowerCase().includes('gấp') || title.toLowerCase().includes('khẩn')) return { label: 'CAO', color: 'text-amber-600 bg-amber-100' };
    return { label: 'TRUNG BÌNH', color: 'text-blue-600 bg-blue-100' };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter & Members Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wide text-[11px]">Thành viên:</span>
          <div className="flex -space-x-2">
            <Avatar className="w-8 h-8 ring-2 ring-white"><AvatarFallback className="bg-blue-600 text-white text-xs">ALL</AvatarFallback></Avatar>
            <Avatar className="w-8 h-8 ring-2 ring-white"><AvatarFallback className="bg-purple-500 text-white text-xs">V</AvatarFallback></Avatar>
            <Avatar className="w-8 h-8 ring-2 ring-white"><AvatarFallback className="bg-emerald-500 text-white text-xs">L</AvatarFallback></Avatar>
            <Avatar className="w-8 h-8 ring-2 ring-white"><AvatarFallback className="bg-amber-500 text-white text-xs">T</AvatarFallback></Avatar>
          </div>
          <Button variant="outline" size="sm" className="ml-2 h-8 rounded-full text-xs font-medium text-brand-primary border-brand-primary/30 hover:bg-brand-primary/5">
            + Thêm nhân viên
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Độ ưu tiên:</span>
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 cursor-pointer hover:bg-slate-200 transition">Khẩn cấp</span>
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 cursor-pointer hover:bg-slate-200 transition">Cao</span>
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 cursor-pointer hover:bg-slate-200 transition">Trung bình</span>
          </div>
          <Button
            onClick={() => { setDefaultStatus('todo'); setIsAddOpen(true); }}
            size="sm"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white h-8 text-xs rounded-full px-4 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Công việc mới
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex min-h-[600px] w-full overflow-x-auto pb-6 gap-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map((col) => {
            const columnTasks = tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.position_order - b.position_order);

            return (
              <div key={col.id} className={cn("flex flex-col w-[320px] shrink-0 bg-slate-50/60 rounded-2xl border border-slate-100 shadow-sm overflow-hidden border-t-4", col.borderTop)}>
                {/* Column Header */}
                <div className={cn("flex items-center justify-between px-4 py-3 mb-2 border-b border-slate-100/50", col.bgHeader)}>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', col.color)} />
                    <h3 className="text-[13px] font-bold text-slate-700 tracking-wider">{col.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center bg-white text-slate-600 text-[11px] font-bold rounded-full h-6 w-6 shadow-sm border border-slate-100">
                      {columnTasks.length}
                    </span>
                    <button
                      onClick={() => handleAddInColumn(col.id as Task['status'])}
                      className="text-slate-400 hover:text-brand-primary transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-100"
                      title="Thêm vào cột này"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 p-3 transition-colors duration-200 min-h-[200px]',
                        snapshot.isDraggingOver ? 'bg-slate-100/80' : ''
                      )}
                    >
                      <div className="flex flex-col gap-3">
                        {columnTasks.map((task, index) => {
                          const priority = getPriorityTag(task.title);
                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Card
                                    className={cn(
                                      'border-slate-200 bg-white transition-all duration-200 cursor-grab active:cursor-grabbing rounded-xl overflow-hidden',
                                      snapshot.isDragging
                                        ? 'shadow-xl border-brand-primary/50 rotate-2 scale-105 z-50'
                                        : 'shadow-sm hover:shadow-md hover:border-slate-300'
                                    )}
                                  >
                                    <div className={cn("w-1 h-full absolute left-0 top-0", col.color)} />
                                    <CardContent className="p-4 pl-5 flex flex-col gap-3">
                                      {/* Tags */}
                                      <div className="flex items-center justify-between">
                                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase", priority.color)}>
                                          {priority.label}
                                        </span>
                                        {task.due_date && (
                                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                                            <Clock className="h-3 w-3" />
                                            {new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                                        {task.title}
                                      </p>
                                      
                                      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                          {task.assignee ? (
                                            <>
                                              <Avatar className="h-6 w-6">
                                                <AvatarImage src={task.assignee.avatar_url || ''} />
                                                <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-medium">
                                                  {task.assignee.full_name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-[11px] font-medium text-slate-600">{task.assignee.full_name || 'Nhân viên'}</span>
                                            </>
                                          ) : (
                                            <div className="flex items-center gap-2">
                                              <div className="h-6 w-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                                <span className="text-[10px] text-slate-400">+</span>
                                              </div>
                                              <span className="text-[11px] text-slate-400">Chưa giao</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}

                        {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-8 opacity-50">
                            <p className="text-xs font-medium text-slate-400">Chưa có công việc</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>

      <TaskFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        projectId={projectId}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
