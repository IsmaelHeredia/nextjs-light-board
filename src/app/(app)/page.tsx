"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Button, IconButton,
  Dialog, DialogTitle, DialogContent, TextField, Stack, Chip, DialogActions, CircularProgress,
  useTheme,
  Tooltip
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";

import { setActiveWorkspace } from "@/store/reducers/workspaceSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { boardPatterns } from "@/skins/theme";
import { Column, Tag, Task, Workspace } from "@/type";
import SortableColumn from "@/components/kanban/SortableColumn";
import SortableTask from "@/components/kanban/SortableTask";
import TagPickerPopover from "@/components/kanban/TagPickerPopover";
import { getContrastColor } from "@/app/lib/colors";

export default function KanbanPage() {

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const activeWs = useSelector((state: RootState) => state.workspace.activeWorkspace);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boardTags, setBoardTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmConfig, setConfirmConfig] = useState<any>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tagAnchor, setTagAnchor] = useState<HTMLButtonElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateBoardTag = (tag: Tag) => {
    setBoardTags(prev => {
      const exists = prev.some(t => t.id === tag.id);
      return exists
        ? prev.map(t => t.id === tag.id ? tag : t)
        : [...prev, tag];
    });

    setTasks(prev =>
      prev.map(task => ({
        ...task,
        tags: task.tags?.map(t => t.id === tag.id ? tag : t) || []
      }))
    );

    if (editingTask?.tags?.some(t => t.id === tag.id)) {
      setEditingTask(prev =>
        prev
          ? {
            ...prev,
            tags: prev.tags?.map(t => t.id === tag.id ? tag : t),
          }
          : null
      );
    }
  };

  const removeTag = (id: string) => {
    setBoardTags((prevTags) => prevTags.filter(t => t.id !== id));
  };

  const dispatch = useDispatch();

  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );

  useEffect(() => {
    fetch("/api/workspaces")
      .then(res => res.json())
      .then(data => setWorkspaces(data));
  }, []);

  useEffect(() => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    fetch(`/api/kanban/${activeWorkspaceId}`)
      .then(res => res.json())
      .then(data => {
        setColumns(data.columns || []);

        const uniqueTasksMap = new Map<string, Task>();
        for (const task of data.tasks || []) {
          uniqueTasksMap.set(task.id, task);
        }

        setTasks(Array.from(uniqueTasksMap.values()));

        setBoardTags((prev) => {
          const map = new Map<string, Tag>();
          [...prev, ...(data.tags || [])].forEach(t => map.set(t.id, t));
          return Array.from(map.values());
        });

        setLoading(false);
      });
  }, [activeWorkspaceId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    fetch(`/api/kanban/${activeWorkspaceId}`)
      .then(res => res.json())
      .then(data => {
        setColumns(data.columns || []);

        const uniqueTasksMap = new Map<string, Task>();
        for (const task of data.tasks || []) {
          uniqueTasksMap.set(task.id, task);
        }

        setTasks(Array.from(uniqueTasksMap.values()));
        setBoardTags(data.tags || []);
        setLoading(false);
      });
  }, [activeWorkspaceId]);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    if (active.data.current?.type === "Column") {
      const oldIndex = columns.findIndex(c => c.id === activeId);
      const newIndex = columns.findIndex(c => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newCols = arrayMove(columns, oldIndex, newIndex);
      setColumns(newCols);

      await fetch("/api/columns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newCols.map((c, i) => ({ id: c.id, order: i })) })
      });
      return;
    }

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overData = over.data.current;
    let targetColumnId = activeTask.columnId;

    if (overData?.type === "Column") {
      targetColumnId = overId;
    } else if (overData?.type === "Task") {
      targetColumnId = overData.task.columnId;
    }

    setTasks((prevTasks) => {
      const oldIndex = prevTasks.findIndex((t) => t.id === activeId);
      const newIndex = prevTasks.findIndex((t) => t.id === overId);

      let newTasks = [...prevTasks];

      const actualNewIndex = newIndex === -1 ? newTasks.length : newIndex;
      newTasks = arrayMove(newTasks, oldIndex, actualNewIndex);

      const finalTasks = newTasks.map((t) => {
        if (t.id === activeId) {
          return { ...t, columnId: targetColumnId };
        }
        return t;
      });

      const columnCounters: Record<string, number> = {};
      const normalizedTasks = finalTasks.map((t) => {
        const currentOrder = columnCounters[t.columnId] || 0;
        columnCounters[t.columnId] = currentOrder + 1;
        return { ...t, order: currentOrder };
      });

      const tasksInTarget = normalizedTasks.filter(t => t.columnId === targetColumnId);
      fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: targetColumnId,
          items: tasksInTarget.map(t => ({ id: t.id, order: t.order }))
        })
      }).then(res => {
        if (!res.ok) console.error("Error al guardar el reordenamiento");
      });

      return normalizedTasks;
    });
  };

  const addTask = async (columnId: string) => {
    const tasksInColumn = tasks.filter(t => t.columnId === columnId);
    const nextOrder = tasksInColumn.length;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Nueva tarjeta",
        columnId,
        order: nextOrder
      })
    });

    const newTask = await res.json();

    setTasks(prev => [
      ...prev,
      { ...newTask, tags: [] }
    ]);
  };

  const handleSaveTaskChanges = async () => {
    if (!editingTask) return;

    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));

    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingTask.id,
        title: editingTask.title,
        description: editingTask.description,
        tags: editingTask.tags
      })
    });

    setEditingTask(null);
  };

  if (!mounted) return null;

  if (loading) {

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          backgroundColor: isDark
            ? "rgba(40, 40, 40, 0.65)"
            : "rgba(251, 241, 199, 0.65)",

          backdropFilter: "blur(10px)",
        }}
      >
        <CircularProgress
          size={84}
          thickness={2.8}
          sx={{
            color: theme.palette.text.primary,
            animationDuration: "0.9s",
          }}
        />
      </Box>
    );
  }

  const currentDefault = isDark ? boardPatterns.dark : boardPatterns.light;

  const overlay = isDark
    ? 'rgba(40, 40, 40, 0.55)'
    : 'rgba(251, 241, 199, 0.65)';

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",

        backgroundColor: activeWs?.image ? "black" : currentDefault.main,
        backgroundImage: activeWs?.image ? "none" : currentDefault.svg,

        "&::before": activeWs?.image
          ? {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `
              linear-gradient(
                to bottom,
                ${isDark
                ? 'rgba(40,40,40,0.45)'
                : 'rgba(251,241,199,0.55)'},
                ${isDark
                ? 'rgba(40,40,40,0.65)'
                : 'rgba(251,241,199,0.75)'}
              ),
              url("${activeWs.image}")
            `,
            backgroundSize: "contain, cover",
            backgroundPosition: "center, center",
            backgroundRepeat: "no-repeat, no-repeat",
            filter: "none",
          }
          : {},

        "&::after": activeWs?.image ? {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          backgroundImage: `url("${activeWs.image}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(30px) brightness(0.7)",
          transform: "scale(1.1)",
        } : {},

        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >

      {!activeWorkspaceId ? (
        <Box
          sx={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            gap: 2,
            zIndex: 1,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Selecciona un workspace para empezar a trabajar
          </Typography>
          <Typography color="textSecondary">
            No hay un workspace activo. Ve al menú de workspaces para seleccionar uno.
          </Typography>
        </Box>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Box sx={{ flexGrow: 1, display: "flex", gap: 2, overflowX: "auto", pb: 2, alignItems: "flex-start" }}>
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map(col => (
                <SortableColumn
                  key={col.id} id={col.id} title={col.title}
                  addTask={addTask}
                  onTitleChange={(val: string) => setColumns(prev => prev.map(c => c.id === col.id ? { ...c, title: val } : c))}
                  onDelete={() => setConfirmConfig({
                    title: "¿Eliminar lista?",
                    onConfirm: () => {
                      fetch("/api/columns", { method: "DELETE", body: JSON.stringify({ id: col.id }) });
                      setColumns(columns.filter(c => c.id !== col.id));
                    }
                  })}
                >
                  <SortableContext items={tasks.filter(t => t.columnId === col.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.filter(t => t.columnId === col.id).map(task => (
                      <SortableTask key={task.id} id={task.id} task={task} onClick={() => setEditingTask({ ...task })} />
                    ))}
                  </SortableContext>
                </SortableColumn>
              ))}
            </SortableContext>

            <Tooltip title={!activeWorkspaceId ? "Selecciona un workspace primero" : ""} arrow>
              <Paper
                onClick={async () => {
                  if (!activeWorkspaceId) return;

                  try {
                    const res = await fetch("/api/columns", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: "Nueva lista",
                        workspaceId: activeWorkspaceId,
                        order: columns.length
                      })
                    });

                    if (res.ok) {
                      const newCol = await res.json();
                      setColumns(prev => [...prev, newCol]);
                    } else {
                      const errorText = await res.text();
                      console.error("Error en servidor:", errorText);
                    }
                  } catch (err) {
                    console.error("Error de red:", err);
                  }
                }}
                sx={{
                  width: 250,
                  minWidth: 250,
                  borderRadius: 2,
                  cursor: !activeWorkspaceId ? "not-allowed" : "pointer",
                  border: '1px solid #ccc',
                  opacity: !activeWorkspaceId ? 0.5 : 1
                }}
              >
                <Button
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{
                    py: 1.5,
                    fontWeight: 800,
                    fontSize: "0.90rem",
                    letterSpacing: "0.05rem",
                    textTransform: "uppercase",
                    pointerEvents: 'none'
                  }}
                  disabled={!activeWorkspaceId}
                >
                  Añadir otra lista
                </Button>
              </Paper>
            </Tooltip>

          </Box>
        </DndContext>
      )}

      <Dialog open={!!editingTask} onClose={() => setEditingTask(null)} fullWidth maxWidth="sm">
        {editingTask && (
          <>
            <DialogTitle
              component="div"
              sx={{ position: 'relative', textAlign: 'center' }}
            >
              <Typography variant="h6" fontWeight={700}>
                Editar tarjeta
              </Typography>

              <IconButton
                onClick={() => setEditingTask(null)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth label="Título"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />

                <TextField
                  fullWidth multiline rows={4} label="Descripción"
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />

                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="textSecondary"
                  >
                    Etiquetas
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                    {editingTask.tags?.map(t => (
                      <Chip
                        key={t.id}
                        label={t.name}
                        size="small"
                        sx={{
                          bgcolor: t.color,
                          color: getContrastColor(t.color),
                          fontWeight: 600
                        }}
                      />
                    ))}
                    <IconButton size="small" onClick={(e) => setTagAnchor(e.currentTarget)}>
                      <AddIcon
                        fontSize="small"
                        sx={(theme) => ({
                          color: theme.palette.text.secondary,
                        })}
                      />
                    </IconButton>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  setConfirmConfig({
                    title: "¿Eliminar esta tarjeta?",
                    onConfirm: async () => {
                      await fetch("/api/tasks", {
                        method: "DELETE",
                        body: JSON.stringify({ id: editingTask.id })
                      });

                      setTasks(prev => prev.filter(t => t.id !== editingTask.id));

                      setEditingTask(null);
                    }
                  });
                }}
              >
                Eliminar
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button color="secondary" variant="outlined" onClick={() => setEditingTask(null)}>Cancelar</Button>
              <Button color="primary" variant="outlined" onClick={handleSaveTaskChanges}>Guardar</Button>
            </DialogActions>

            <TagPickerPopover
              anchorEl={tagAnchor}
              onClose={() => setTagAnchor(null)}
              taskTags={editingTask.tags || []}
              allBoardTags={boardTags}
              tasks={tasks}
              onToggleTag={(tag: Tag) => {
                const exists = editingTask.tags?.some(t => t.id === tag.id);
                setEditingTask({
                  ...editingTask,
                  tags: exists
                    ? editingTask.tags.filter(t => t.id !== tag.id)
                    : [...(editingTask.tags || []), tag]
                });
              }}
              onUpdateBoardTags={updateBoardTag}
              onRemoveBoardTag={removeTag}
              setConfirmConfig={setConfirmConfig}
              workspaceId={activeWorkspaceId}
            />

          </>
        )}
      </Dialog>

      {confirmConfig && <ConfirmDialog open={true} title={confirmConfig.title} onConfirm={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }} onClose={() => setConfirmConfig(null)} />}
    </Box>
  );
}