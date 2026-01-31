import {
  Box,
  Paper,
  Button,
  IconButton,
  InputBase
} from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

function SortableColumn({
  id,
  title,
  children,
  onDelete,
  onTitleChange,
  addTask,
  isOverlay = false,
}: any) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id,
      data: { type: "Column" },
    });

  const saveTitle = async (newTitle: string) => {
    await fetch("/api/columns", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: newTitle }),
    });
  };

  const style = isOverlay
    ? {}
    : {
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 100 : 1,
      opacity: isDragging ? 0.6 : 1,
    };

  return (
    <Box ref={setNodeRef} style={style} sx={{ flexShrink: 0 }}>
      <Paper
        sx={{
          width: 280,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "calc(100vh - 120px)",
          borderRadius: 2,
          boxShadow: 2,
          cursor: isOverlay ? "default" : "grab",
          touchAction: isOverlay ? "auto" : "none",
        }}
      >
        <Box
          {...(!isOverlay ? attributes : {})}
          {...(!isOverlay ? listeners : {})}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            p: 1.5,
            gap: 0.5,
            width: "100%",
            boxSizing: "border-box",
            cursor: isOverlay ? "default" : "grab",
          }}
        >
          <InputBase
            multiline
            fullWidth
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={(e) => saveTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              flex: 1,
              minWidth: 0,
              "& .MuiInputBase-input": {
                padding: "2px 4px",
                lineHeight: 1.2,
                whiteSpace: "normal",
                wordBreak: "break-all",
                overflowWrap: "anywhere",
              },
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ flexShrink: 0, mt: 0.2 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            px: 1,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            touchAction: "pan-y",
            scrollbarWidth: "thin",
            scrollbarColor: "#999 transparent",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#999", borderRadius: 4 },
          }}
        >
          {children}
        </Box>

        <Box sx={{ p: 1, flexShrink: 0, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addTask(id)}
            fullWidth
            sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 1.5 }}
          >
            Añadir tarjeta
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default SortableColumn;