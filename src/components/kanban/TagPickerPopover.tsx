import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, IconButton,
    TextField, Stack, Checkbox, Popover, Grid
} from "@mui/material";
import { Tag, Task } from "@/type";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LockIcon from '@mui/icons-material/Lock';
import { getContrastColor } from "@/app/lib/colors";

function TagPickerPopover({
    anchorEl,
    onClose,
    taskTags,
    onToggleTag,
    allBoardTags,
    onUpdateBoardTags,
    onRemoveBoardTag,
    setConfirmConfig,
    workspaceId,
    tasks
}: any) {

    const tagUsageCount = (tagId: string, tasks: Task[]) =>
        tasks.filter(task => task.tags?.some(t => t.id === tagId)).length;

    const TRELLO_COLORS = [
        // Verdes
        "#baf3db", "#4bce97", "#1f845a", "#164b35",

        // Amarillos / Dorados
        "#f8e6a0", "#e2b203", "#946f00", "#7f5f01",

        // Naranjas
        "#fedec8", "#faa53d", "#b65d13", "#904d00",

        // Rojos / Rosas
        "#ffd5d2", "#f87168", "#ae2e24", "#5d1f1a",

        // Morados
        "#dfd8fd", "#9f8fef", "#5e4db2", "#352c63",

        // Azules / Celestes
        "#caedfb", "#60c6ed", "#1d7f8c", "#20505a",

        // Azules
        "#cce0ff", "#579dff", "#0c66e4", "#002d6d",

        // Limas / Verdes
        "#d3f1a7", "#94c74a", "#5b7f24", "#37471f",

        // Rosados / Magenta
        "#fdd0ec", "#e774bb", "#ae4787", "#50253f",

        // Grises / Neutros
        "#dcdfe4", "#8590a2", "#44546f", "#2c333f"
    ];

    const [view, setView] = useState<"list" | "create">("list");
    const [tagName, setTagName] = useState("");
    const [tagColor, setTagColor] = useState<string | null>(null);

    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const handleSaveTag = async () => {
        if (!tagName) return;

        if (editingTag) {
            const res = await fetch("/api/tags", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingTag.id, name: tagName, color: tagColor })
            });
            const updatedTag = await res.json();
            onUpdateBoardTags(updatedTag);
            setEditingTag(null);
        } else {
            const res = await fetch("/api/tags", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: tagName, color: tagColor, workspaceId })
            });
            const newTag = await res.json();
            onUpdateBoardTags(newTag);
        }

        setView("list");
        setTagName("");
        setTagColor(TRELLO_COLORS[5]);
    };

    useEffect(() => {
        if (view === "create" && !editingTag) {
            setTagName("");
            setTagColor(null);
        }
    }, [view, editingTag]);

    const colorAlreadyUsed = allBoardTags.some((t: Tag) => t.color === tagColor);

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => { onClose(); setView("list"); }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            PaperProps={{
                sx: {
                    width: 320,
                    maxHeight: '100vh',
                    p: 2,
                    borderRadius: 3,
                    overflowX: 'hidden'
                }
            }}
        >
            {view === "list" ? (
                <Stack spacing={1.5}>
                    <Typography
                        variant="subtitle2"
                        textAlign="center"
                        fontWeight={700}
                        color="textSecondary"
                        sx={{
                            fontSize: "1.4rem"
                        }}
                    >
                        Etiquetas
                    </Typography>
                    <Box sx={{ maxHeight: 250, overflowY: 'auto', px: 0.5 }}>
                        {allBoardTags.map((tag: Tag, idx: number) => {
                            const usageCount = tagUsageCount(tag.id, tasks);

                            return (
                                <Box
                                    key={`${tag.id}-${idx}`}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 0.5,
                                        minWidth: 0,
                                        gap: 1
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={taskTags.some((t: any) => t.id === tag.id)}
                                        onChange={() => onToggleTag(tag)}
                                        sx={{ p: 0.5 }}
                                    />

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            flexGrow: 1,
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            bgcolor: tag.color,
                                            color: 'white',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            display: 'inline-block'
                                        }}
                                        onClick={() => onToggleTag(tag)}
                                    >
                                        {tag.name}
                                    </Typography>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingTag(tag);
                                            setTagName(tag.name);
                                            setTagColor(tag.color);
                                            setView("create");
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>

                                    <IconButton
                                        size="small"
                                        disabled={usageCount > 0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (usageCount > 0) return;

                                            setConfirmConfig({
                                                title: `¿Eliminar la etiqueta "${tag.name}"?`,
                                                onConfirm: async () => {
                                                    await fetch("/api/tags", {
                                                        method: "DELETE",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ id: tag.id })
                                                    });

                                                    onRemoveBoardTag(tag.id);
                                                }
                                            });
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            );

                        })}

                    </Box>
                    <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            setEditingTag(null);
                            setView("create");
                        }}
                        sx={{
                            textTransform: 'none'
                        }}>
                        Crear nueva etiqueta
                    </Button>
                </Stack>
            ) : (
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center">
                        <IconButton size="small" onClick={() => setView("list")}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                flexGrow: 1,
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: "1.5rem",
                                mr: 1
                            }}
                        >
                            {editingTag ? "Editar etiqueta" : "Crear etiqueta"}
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            bgcolor: tagColor ?? "grey.200",
                            p: 2,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                color: getContrastColor(tagColor),
                                fontWeight: 700,
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {tagName || "Vista previa"}
                        </Typography>
                    </Box>

                    <TextField
                        size="small"
                        fullWidth
                        label="Título"
                        autoFocus value={tagName}
                        disabled={!editingTag && colorAlreadyUsed}
                        onChange={(e) => setTagName(e.target.value)}
                    />

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "8px",
                            width: "100%",
                            mt: 1,
                            mb: 1
                        }}
                    >
                        {TRELLO_COLORS.map((color) => {
                            const colorLower = color.toLowerCase();
                            const tagColorLower = tagColor?.toLowerCase() ?? null;

                            const isUsed = allBoardTags.some(
                                (t: Tag) => t.color.toLowerCase() === colorLower && t.id !== editingTag?.id
                            );

                            const isSelected =
                                tagColorLower !== null && colorLower === tagColorLower;

                            return (
                                <Box
                                    key={color}
                                    onClick={() => { if (!isUsed) setTagColor(color); }}
                                    sx={{
                                        height: 32,
                                        bgcolor: color,
                                        borderRadius: 1,
                                        cursor: isUsed ? "not-allowed" : "pointer",
                                        position: "relative",
                                        border: isSelected
                                            ? '3px solid #000'
                                            : '1px solid transparent',
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            transform: isUsed ? "none" : "scale(1.1)",
                                            opacity: isUsed ? 0.8 : 1,
                                        },
                                    }}
                                >
                                    {isUsed && !isSelected && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                inset: 0,
                                                bgcolor: "rgba(0,0,0,0.25)",
                                                borderRadius: 1,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                zIndex: 1,
                                            }}
                                        >
                                            <LockIcon sx={{ fontSize: 16, color: "white" }} />
                                        </Box>
                                    )}

                                    {isSelected && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 2,
                                                right: 2,
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                bgcolor: "white",
                                                border: "1px solid black",
                                                zIndex: 2,
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>


                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleSaveTag}
                        disabled={!tagName || !tagColor || (!editingTag && colorAlreadyUsed)}
                    >
                        {editingTag ? "Guardar" : "Crear"}
                    </Button>

                </Stack>
            )}
        </Popover>
    );
}

export default TagPickerPopover;