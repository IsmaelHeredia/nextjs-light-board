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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

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
}: {
    ws: Workspace;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: ws.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : "auto",
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <Grid item xs={12} sm={6} md={4} lg={3} ref={setNodeRef} style={style}>
            <Card
                sx={{
                    borderRadius: 3,
                    cursor: "grab",
                    transition: "0.3s",
                    "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        transform: "translateY(-4px)",
                    },
                    "&:active": { cursor: "grabbing" },
                }}
            >
                <Box {...attributes} {...listeners} onClick={onSelect} sx={{ cursor: "pointer" }}>
                    {ws.image ? (
                        <CardMedia
                            component="img"
                            height="140"
                            image={ws.image}
                            alt={ws.title}
                            sx={{ objectFit: "cover" }}
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
                                bgcolor: "action.hover"
                            }}
                        >
                            <BusinessCenterIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                            <Typography variant="caption" sx={{ mt: 1, fontWeight: 600, opacity: 0.7 }}>
                                Sin fondo
                            </Typography>
                        </Box>
                    )}
                </Box>

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
                                maxWidth: "70%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontSize: "1rem",
                                cursor: "default"
                            }}
                        >
                            {ws.title}
                        </Typography>
                    </Tooltip>

                    <Stack direction="row" spacing={0.5}>
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
                            color="error"
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

    const [localEdit, setLocalEdit] = useState<Workspace | null>(null);
    const [gallery, setGallery] = useState<GalleryImage[]>([]);
    const [uploading, setUploading] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

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
                </AppBar>

                <Box
                    sx={{
                        pt: { xs: 2, md: 3 },
                        px: { xs: 2, md: 6 },
                        pb: { xs: 2, md: 6 },
                        minHeight: "calc(100vh - 64px)",
                        backgroundColor: theme.palette.background.default,
                        overflowY: "auto",
                        height: "calc(100vh - 64px)",
                        "&::-webkit-scrollbar": { width: "8px" },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#ccc",
                            borderRadius: "4px"
                        }
                    }}
                >
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={workspaces.map((w) => w.id)} strategy={rectSortingStrategy}>
                            <Grid container spacing={4}>
                                {workspaces.map((ws) => (
                                    <SortableWorkspaceCard
                                        key={ws.id}
                                        ws={ws}
                                        onSelect={() => onSelectWorkspace(ws.id)}
                                        onEdit={() => setLocalEdit({ ...ws })}
                                        onDelete={() => setWorkspaceToDelete(ws)}
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
                            onClick={() => {
                                if (localEdit) onUpdate(localEdit);
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
                open={!!imgToDelete}
                title="¿Eliminar esta imagen?"
                onConfirm={confirmDeleteImage}
                onClose={() => setImgToDelete(null)}
            />
        </>
    );
}