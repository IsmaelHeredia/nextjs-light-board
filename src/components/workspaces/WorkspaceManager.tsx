"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    Card,
    CardContent,
    CardMedia,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Grid,
    AppBar,
    Toolbar,
    CircularProgress,
    Tooltip,
    Tabs,
    Tab,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import LockIcon from "@mui/icons-material/Lock";

import { ConfirmDialog } from "../modals/ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import { selectTheme } from "@/store/reducers/themesSlice";

import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    rectSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GalleryImage, Workspace } from "@/type";
import { removeActiveWorkspace } from "@/store/reducers/workspaceSlice";

function SortableWorkspaceCard({
    ws,
    onSelect,
    onEdit,
    onDelete,
    onArchive,
    onReopen,
    draggable = true,
    reopening = false,
}: {
    ws: Workspace;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onArchive: () => void;
    onReopen: () => void;
    draggable?: boolean;
    reopening?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: ws.id, disabled: !draggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : "auto",
        opacity: isDragging ? 0.6 : 1,
    };

    const isArchived = !!ws.archived;

    return (
        <Grid item xs={12} sm={6} md={4} lg={3} ref={setNodeRef} style={style}>
            <Card
                sx={{
                    borderRadius: 3,
                    cursor: draggable ? "grab" : "default",
                    transition: "0.3s",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        transform: isArchived ? "none" : "translateY(-4px)",
                    },
                    "&:active": { cursor: draggable ? "grabbing" : "default" },
                }}
            >
                <Box
                    {...(draggable ? attributes : {})}
                    {...(draggable ? listeners : {})}
                    onClick={!isArchived ? onSelect : undefined}
                    sx={{ cursor: isArchived ? "default" : "pointer" }}
                >
                    {ws.image ? (
                        <CardMedia
                            component="img"
                            height="140"
                            image={ws.image}
                            alt={ws.title}
                            sx={{
                                objectFit: "cover",
                                filter: isArchived ? "grayscale(85%) brightness(0.65)" : "none",
                                transition: "filter 0.4s ease",
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                height: 140,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                color: "text.secondary",
                                bgcolor: "action.hover",
                                filter: isArchived ? "grayscale(85%) brightness(0.65)" : "none",
                                transition: "filter 0.4s ease",
                            }}
                        >
                            <BusinessCenterIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                            <Typography variant="caption" sx={{ mt: 1, fontWeight: 600, opacity: 0.7 }}>
                                Sin fondo
                            </Typography>
                        </Box>
                    )}
                </Box>

                {isArchived && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 140,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            backdropFilter: "blur(3px)",
                            background: "rgba(0,0,0,0.35)",
                            color: "#fff",
                        }}
                    >
                        <LockIcon sx={{ fontSize: 30 }} />
                        <Typography fontWeight={800} sx={{ letterSpacing: 1.2, fontSize: "0.75rem" }}>
                            ARCHIVADO
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            disabled={reopening}
                            startIcon={
                                reopening
                                    ? <CircularProgress size={14} thickness={5} sx={{ color: "#111" }} />
                                    : <UnarchiveIcon fontSize="small" />
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                onReopen();
                            }}
                            sx={{
                                borderRadius: 5,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "#fff",
                                color: "#111",
                                "&:hover": { bgcolor: "#eee" },
                                "&.Mui-disabled": {
                                    bgcolor: "#eee",
                                    color: "#111",
                                    opacity: 0.8,
                                },
                            }}
                        >
                            {reopening ? "Reabriendo..." : "Reabrir"}
                        </Button>
                    </Box>
                )}

                <CardContent
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Tooltip
                        title={ws.title}
                        arrow
                        placement="top"
                        enterDelay={400}
                        leaveDelay={200}
                    >
                        <Typography
                            fontWeight={800}
                            sx={{
                                maxWidth: "60%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "1rem",
                                cursor: "default",
                            }}
                        >
                            {ws.title}
                        </Typography>
                    </Tooltip>

                    <Stack direction="row" spacing={0.5}>
                        {!isArchived ? (
                            <>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                >
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onArchive();
                                    }}
                                >
                                    <ArchiveIcon fontSize="inherit" />
                                </IconButton>
                            </>
                        ) : null}
                        <IconButton
                            size="small"
                            color="error"
                            disabled={reopening}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
}

export default function WorkspaceManager({
    open,
    onClose,
    workspaces,
    setWorkspaces,
    onSelectWorkspace,
    onUpdate,
    onDelete,
}: {
    open: boolean;
    onClose: () => void;
    workspaces: Workspace[];
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
    onSelectWorkspace: (id: string) => void;
    onUpdate: (ws: Workspace) => void;
    onDelete: (id: string) => void;
}) {
    const theme = useSelector(selectTheme);

    const [tab, setTab] = useState<"active" | "archived">("active");
    const [archivedWorkspaces, setArchivedWorkspaces] = useState<Workspace[]>([]);
    const [loadingArchived, setLoadingArchived] = useState(false);
    const [reopeningId, setReopeningId] = useState<string | null>(null);

    const [localEdit, setLocalEdit] = useState<Workspace | null>(null);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
    const [workspaceToArchive, setWorkspaceToArchive] = useState<Workspace | null>(null);

    const [imgToDelete, setImgToDelete] = useState<GalleryImage | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const ALLOWED_TYPES = ["image/jpeg", "image/png"];

    const dispatch = useDispatch();

    useEffect(() => {
        if (open) {
            fetch("/api/gallery")
                .then((res) => res.json())
                .then(setGallery)
                .catch((err) => console.error("Error cargando galería:", err));
        }
    }, [open]);

    useEffect(() => {
        if (open && tab === "archived") {
            setLoadingArchived(true);
            fetch("/api/workspaces/archived")
                .then((res) => res.json())
                .then(setArchivedWorkspaces)
                .catch((err) => console.error("Error cargando archivados:", err))
                .finally(() => setLoadingArchived(false));
        }
    }, [open, tab]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = workspaces.findIndex((w) => w.id === active.id);
        const newIndex = workspaces.findIndex((w) => w.id === over.id);

        const reordered = arrayMove(workspaces, oldIndex, newIndex);

        setWorkspaces(reordered);

        try {
            const response = await fetch("/api/workspaces/reorder", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    reordered.map((w, index) => ({
                        id: w.id,
                        order: index,
                    }))
                ),
            });

            if (!response.ok) throw new Error("Error en el servidor");
        } catch (err) {
            console.error("Error guardando orden:", err);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !localEdit) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert("Solo se permiten imágenes JPG o PNG");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (data.id) {
                setLocalEdit({ ...localEdit, imageId: data.id, image: data.url });
                const updatedGallery = await fetch("/api/gallery").then((r) => r.json());
                setGallery(updatedGallery);
            }
        } catch (err) {
            console.error("Error subiendo imagen:", err);
        } finally {
            setUploading(false);
        }
    };

    const confirmDeleteImage = async () => {
        if (!imgToDelete) return;

        try {
            const res = await fetch(`/api/gallery/${imgToDelete.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setGallery(prev => prev.filter(img => img.id !== imgToDelete.id));

                if (localEdit?.imageId === imgToDelete.id) {
                    setLocalEdit(prev =>
                        prev ? { ...prev, imageId: undefined, image: undefined } : null
                    );
                }
            }
        } catch (err) {
            console.error("Error eliminando imagen:", err);
        } finally {
            setImgToDelete(null);
        }
    };

    const confirmArchiveWorkspace = async () => {
        if (!workspaceToArchive) return;

        try {
            const res = await fetch(`/api/workspaces/${workspaceToArchive.id}/archive`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: true }),
            });

            if (res.ok) {
                setWorkspaces(prev => prev.filter(w => w.id !== workspaceToArchive.id));
                dispatch(removeActiveWorkspace(workspaceToArchive.id));
            }
        } catch (err) {
            console.error("Error archivando workspace:", err);
        } finally {
            setWorkspaceToArchive(null);
        }
    };

    const handleReopen = async (ws: Workspace) => {
        setReopeningId(ws.id);
        try {
            const res = await fetch(`/api/workspaces/${ws.id}/archive`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false }),
            });

            if (!res.ok) return;

            setArchivedWorkspaces(prev => prev.filter(w => w.id !== ws.id));

            const activeRes = await fetch("/api/workspaces");
            if (activeRes.ok) {
                const freshActive = await activeRes.json();
                setWorkspaces(freshActive);
            }
        } catch (err) {
            console.error("Error reabriendo workspace:", err);
        } finally {
            setReopeningId(null);
        }
    };

    const handleDeleteArchived = async (ws: Workspace) => {
        await fetch(`/api/workspaces/${ws.id}`, { method: "DELETE" });
        setArchivedWorkspaces(prev => prev.filter(w => w.id !== ws.id));
    };

    return (
        <>
            <Dialog fullScreen open={open} onClose={onClose}>
                <AppBar sx={{ position: "relative", boxShadow: "none", borderBottom: "1px solid #e0e0e0" }}>
                    <Toolbar sx={{ backgroundColor: theme.palette.customNavbar?.background }}>
                        <BusinessCenterIcon sx={{ mr: 2 }} />
                        <Typography sx={{ flex: 1, fontWeight: 800 }} variant="h6">
                            Mis espacios de trabajo
                        </Typography>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>

                    <Tabs
                        value={tab}
                        onChange={(_, val) => setTab(val)}
                        sx={{
                            backgroundColor: theme.palette.customNavbar?.background,
                            px: { xs: 2, md: 6 },
                        }}
                        textColor="inherit"
                    >
                        <Tab value="active" label="Activos" sx={{ fontWeight: 700, textTransform: "none" }} />
                        <Tab value="archived" label="Archivados" sx={{ fontWeight: 700, textTransform: "none" }} />
                    </Tabs>
                </AppBar>

                <Box
                    sx={{
                        pt: { xs: 2, md: 3 },
                        px: { xs: 2, md: 6 },
                        pb: { xs: 2, md: 6 },
                        minHeight: "calc(100vh - 112px)",
                        backgroundColor: theme.palette.background.default,
                        overflowY: "auto",
                        height: "calc(100vh - 112px)",
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#ccc",
                            borderRadius: "4px"
                        }
                    }}
                >
                    {tab === "active" ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={workspaces.map((w) => w.id)} strategy={rectSortingStrategy}>
                                <Grid container spacing={4}>
                                    {workspaces.map((ws) => (
                                        <SortableWorkspaceCard
                                            key={ws.id}
                                            ws={ws}
                                            draggable
                                            onSelect={() => onSelectWorkspace(ws.id)}
                                            onEdit={() => setLocalEdit({ ...ws })}
                                            onDelete={() => setWorkspaceToDelete(ws)}
                                            onArchive={() => setWorkspaceToArchive(ws)}
                                            onReopen={() => {}}
                                        />
                                    ))}

                                    <Grid item xs={12} sm={6} md={4} lg={3}>
                                        <Paper
                                            onClick={async () => {
                                                const res = await fetch("/api/workspaces", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        title: "Nuevo Espacio",
                                                        image: "/images/default-bg.jpg",
                                                    }),
                                                });
                                                const newWs = await res.json();
                                                setWorkspaces((prev) => [...prev, newWs]);
                                            }}
                                            sx={{
                                                minHeight: 205,
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                borderRadius: 3,
                                                border: "2px dashed #b0b8c4",
                                                transition: "0.3s",
                                                "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }
                                            }}
                                        >
                                            <AddIcon sx={{ fontSize: 48 }} />
                                            <Typography fontWeight={700}>Crear espacio</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </SortableContext>
                        </DndContext>
                    ) : loadingArchived ? (
                        <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : archivedWorkspaces.length === 0 ? (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                pt: 8,
                                gap: 1,
                                color: "text.secondary",
                            }}
                        >
                            <ArchiveIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                            <Typography fontWeight={700}>No hay espacios archivados</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={4}>
                            {archivedWorkspaces.map((ws) => (
                                <SortableWorkspaceCard
                                    key={ws.id}
                                    ws={ws}
                                    draggable={false}
                                    reopening={reopeningId === ws.id}
                                    onSelect={() => {}}
                                    onEdit={() => {}}
                                    onArchive={() => {}}
                                    onDelete={() => handleDeleteArchived(ws)}
                                    onReopen={() => handleReopen(ws)}
                                />
                            ))}
                        </Grid>
                    )}
                </Box>

                <Dialog open={!!localEdit} onClose={() => setLocalEdit(null)} maxWidth="sm" fullWidth>
                    <DialogTitle
                        component="div"
                        sx={{
                            position: "relative",
                            textAlign: "center",
                            fontWeight: 800,
                        }}
                    >
                        <Typography variant="h6" fontWeight={800}>
                            Ajustes del espacio
                        </Typography>

                        <IconButton
                            onClick={() => setLocalEdit(null)}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3}>
                            <TextField
                                label="Nombre"
                                fullWidth
                                value={localEdit?.title || ""}
                                onChange={(e) => setLocalEdit(prev => prev ? { ...prev, title: e.target.value } : null)}
                            />

                            <Box sx={{
                                height: 140, borderRadius: 2, overflow: "hidden",
                                backgroundColor: theme.palette.background.default,
                                display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #eee"
                            }}>
                                {localEdit?.image ? (
                                    <Box component="img" src={localEdit.image} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <Typography variant="caption" fontWeight={600} color="text.secondary">Sin fondo seleccionado</Typography>
                                )}
                            </Box>

                            <Grid container spacing={1}>
                                {gallery.map((img) => (
                                    <Grid item xs={4} key={img.id}>
                                        <Box
                                            onClick={() => setLocalEdit(prev => prev ? { ...prev, imageId: img.id, image: img.url } : null)}
                                            sx={{
                                                height: 64,
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                overflow: "hidden",
                                                position: "relative",
                                                border: localEdit?.imageId === img.id ? "3px solid #1976d2" : "1px solid #ddd",
                                                opacity: localEdit?.imageId === img.id ? 1 : 0.85,
                                                "&:hover": { opacity: 1 }
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={img.url}
                                                onClick={() =>
                                                    setLocalEdit(prev =>
                                                        prev ? { ...prev, imageId: img.id, image: img.url } : null
                                                    )
                                                }
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />

                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImgToDelete(img);
                                                }}
                                                sx={{
                                                    position: "absolute",
                                                    top: 4,
                                                    right: 4,
                                                    width: 22,
                                                    height: 22,
                                                    p: 0,
                                                    borderRadius: "50%",
                                                    bgcolor: "rgba(0,0,0,0.45)",
                                                    color: "#fff",
                                                    opacity: 0,
                                                    transition: "opacity 0.2s ease, background-color 0.2s ease",
                                                    "&:hover": {
                                                        bgcolor: "rgba(211,47,47,0.9)",
                                                    },
                                                    ".MuiBox-root:hover &": {
                                                        opacity: 1,
                                                    },
                                                }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 14 }} />
                                            </IconButton>


                                        </Box>
                                    </Grid>
                                ))}

                                <Grid item xs={4}>
                                    <Button component="label" sx={{ height: 64, width: "100%", border: "1px dashed #ccc" }}>
                                        {uploading ? <CircularProgress size={24} /> : <AddIcon />}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/jpeg, image/png"
                                            onChange={handleFileUpload}
                                        />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button color="secondary" variant="outlined" onClick={() => setLocalEdit(null)}>Cancelar</Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            disabled={!localEdit?.title.trim()}
                            onClick={() => {
                                if (!localEdit?.title.trim()) return;
                                onUpdate(localEdit);
                                setLocalEdit(null);
                            }}
                        >
                            Guardar Cambios
                        </Button>
                    </DialogActions>
                </Dialog>
            </Dialog>

            <ConfirmDialog
                open={!!workspaceToDelete}
                title={`¿Eliminar el workspace "${workspaceToDelete?.title}"?`}
                onConfirm={async () => {
                    if (!workspaceToDelete) return;

                    await fetch(`/api/workspaces/${workspaceToDelete.id}`, { method: "DELETE" });

                    setWorkspaces(prev => prev.filter(w => w.id !== workspaceToDelete.id));

                    dispatch(removeActiveWorkspace(workspaceToDelete.id));

                    setWorkspaceToDelete(null);
                }}
                onClose={() => setWorkspaceToDelete(null)}
            />

            <ConfirmDialog
                open={!!workspaceToArchive}
                title={`¿Archivar el workspace "${workspaceToArchive?.title}"?`}
                description="Podrás reabrirlo en cualquier momento desde la pestaña Archivados."
                onConfirm={confirmArchiveWorkspace}
                onClose={() => setWorkspaceToArchive(null)}
            />

            <ConfirmDialog
                open={!!imgToDelete}
                title="¿Eliminar esta imagen?"
                onConfirm={confirmDeleteImage}
                onClose={() => setImgToDelete(null)}
            />
        </>
    );
}