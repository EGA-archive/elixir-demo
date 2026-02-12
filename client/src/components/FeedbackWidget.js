import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Rating from "@mui/material/Rating";
import config from "../config/config.json";

const FONT = '"Open Sans", sans-serif';
const TEXT_SIZE = "13px";
const TITLE_SIZE = "14px";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle");

  // open after short delay
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // auto close after success
  useEffect(() => {
    if (status === "sent") {
      const t = setTimeout(() => setOpen(false), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const sendFeedback = async () => {
    if (status === "sending") return;

    setStatus("sending");

    try {
      const res = await fetch("http://localhost:4010/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) throw new Error();

      setStatus("sent");
      setRating(null);
      setComment("");
      setCollapsed(true);
    } catch {
      setStatus("error");
    }
  };

  if (!open) {
    return (
      <IconButton
        onClick={() => {
          setOpen(true);
          setStatus("idle");
        }}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          bgcolor: config.ui.colors.primary,
          color: "#fff",
          "&:hover": { bgcolor: config.ui.colors.darkPrimary },
          zIndex: 1300,
        }}
      >
        <ChatBubbleOutlineIcon />
      </IconButton>
    );
  }

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: collapsed ? 220 : 320,
        p: collapsed ? 1 : 2,
        zIndex: 1300,
        fontFamily: FONT,
        "& *": { fontFamily: FONT },
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: TITLE_SIZE, fontWeight: 600 }}>
          Feedback
        </Typography>

        <Box>
          <IconButton size="medium" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>

          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {!collapsed && (
        <>
          <Box mt={1}>
            <Typography sx={{ fontSize: TEXT_SIZE }}>
              How was your experience?
            </Typography>

            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              sx={{ color: config.ui.colors.primary }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            placeholder="Tell us your feedback"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              mt: 1,
              "& .MuiInputBase-input": {
                fontFamily: FONT,
                fontSize: TEXT_SIZE,
                lineHeight: 1.4,
              },
              "& .MuiInputBase-root": {
                fontFamily: FONT,
              },
            }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={status === "sending" || (!rating && !comment.trim())}
            onClick={sendFeedback}
            sx={{
              mt: 1,
              fontSize: TEXT_SIZE,
              textTransform: "none",
              bgcolor: config.ui.colors.primary,
              "&:hover": { bgcolor: config.ui.colors.darkPrimary },
            }}
          >
            Send
          </Button>

          {status === "sending" && (
            <Typography sx={{ fontSize: "12px", mt: 1 }}>Sending...</Typography>
          )}

          {status === "sent" && (
            <Typography sx={{ fontSize: "12px", mt: 1, color: "success.main" }}>
              Feedback sent ✓
            </Typography>
          )}

          {status === "error" && (
            <Typography sx={{ fontSize: "12px", mt: 1, color: "error.main" }}>
              Could not send feedback
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}
