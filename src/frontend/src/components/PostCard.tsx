import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  MoreVertical,
  Send,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import type { PostDTO, Profile } from "../backend";
import {
  useCommentOnPost,
  useFormatTimestamp,
  useLikePost,
} from "../hooks/useQueries";

interface Props {
  post: PostDTO;
  myPrincipal: Principal | null;
  profiles: Map<string, Profile>;
  onUserClick?: (p: Principal) => void;
  onDelete?: (postId: string) => void;
}

// Parse encoded content: caption|||tags:...|||loc:...
function parsePostContent(raw: string) {
  const parts = raw.split("|||");
  let caption = parts[0] ?? "";
  let tags = "";
  let location = "";
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("tags:")) tags = part.slice(5);
    else if (part.startsWith("loc:")) location = part.slice(4);
    else caption += (caption ? " " : "") + part;
  }
  return { caption, tags, location };
}

export default function PostCard({
  post,
  myPrincipal,
  profiles,
  onUserClick,
  onDelete,
}: Props) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const likePost = useLikePost();
  const commentOnPost = useCommentOnPost();
  const formatTs = useFormatTimestamp();

  const authorProfile = profiles.get(post.author.toString());
  const isLiked = myPrincipal
    ? post.likes.some((l) => l.toString() === myPrincipal.toString())
    : false;
  const isMyPost = myPrincipal
    ? post.author.toString() === myPrincipal.toString()
    : false;

  const { caption, tags, location } = parsePostContent(post.content);
  const tagList = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const handleLike = async () => {
    try {
      await likePost.mutateAsync({ postId: post.id, liked: isLiked });
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await commentOnPost.mutateAsync({
        postId: post.id,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch {}
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.(post.id.toString());
  };

  return (
    <article
      data-ocid="feed.post.card"
      className="bg-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => onUserClick?.(post.author)}
          className="flex items-center gap-3 flex-1"
        >
          <Avatar className="w-9 h-9">
            {authorProfile?.avatar && (
              <AvatarImage src={authorProfile.avatar.getDirectURL()} />
            )}
            <AvatarFallback className="bg-muted text-sm">
              {authorProfile?.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-semibold leading-none">
              {authorProfile?.displayName || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatTs(post.timestamp)}
            </p>
          </div>
        </button>

        {/* 3-dot menu for own posts */}
        {isMyPost && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-ocid="feed.post.button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-9 z-10 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[140px]"
                onBlur={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  data-ocid="feed.post.delete_button"
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <img
          src={post.image.getDirectURL()}
          alt="Post"
          className="w-full object-cover max-h-80"
          loading="lazy"
        />
      )}

      {/* Caption */}
      {caption && (
        <p className="px-3 py-2 text-sm leading-relaxed">{caption}</p>
      )}

      {/* Tags */}
      {tagList.length > 0 && (
        <div className="px-3 pb-1 flex flex-wrap gap-1">
          {tagList.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))",
                color: "#f472b6",
                border: "1px solid rgba(236,72,153,0.2)",
              }}
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {location && (
        <div className="px-3 pb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{location}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 pb-2">
        <button
          type="button"
          data-ocid="feed.post.toggle"
          onClick={handleLike}
          disabled={likePost.isPending}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {post.likes.length}
          </span>
        </button>

        <button
          type="button"
          data-ocid="feed.post.secondary_button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {post.comments.length}
          </span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-border px-3 py-2">
          {post.comments.length > 0 && (
            <div className="flex flex-col gap-2 mb-3 max-h-40 overflow-y-auto">
              {post.comments.map((c) => {
                const cp = profiles.get(c.author.toString());
                return (
                  <div key={c.id.toString()} className="flex gap-2">
                    <Avatar className="w-6 h-6 shrink-0">
                      {cp?.avatar && (
                        <AvatarImage src={cp.avatar.getDirectURL()} />
                      )}
                      <AvatarFallback className="text-[10px] bg-muted">
                        {cp?.displayName?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {cp?.displayName || "User"}
                      </span>
                      <span className="text-xs text-foreground/80">
                        {c.content}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <form onSubmit={handleComment} className="flex gap-2">
            <Input
              data-ocid="feed.post.input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="bg-input border-border h-8 text-sm"
            />
            <Button
              type="submit"
              data-ocid="feed.post.submit_button"
              size="sm"
              disabled={commentOnPost.isPending || !commentText.trim()}
              className="h-8 px-2 bg-primary hover:bg-primary/90"
            >
              {commentOnPost.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}
