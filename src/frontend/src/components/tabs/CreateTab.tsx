import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileImage, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import { useState } from "react";
import { ExternalBlob } from "../../backend";
import { useCreatePost, useCreateStory } from "../../hooks/useQueries";

interface Props {
  onSuccess: () => void;
}

export default function CreateTab({ onSuccess }: Props) {
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [postMedia, setPostMedia] = useState<ExternalBlob | null>(null);
  const [postMediaPreview, setPostMediaPreview] = useState("");
  const [postMediaType, setPostMediaType] = useState<"image" | "video">(
    "image",
  );
  const [storyImage, setStoryImage] = useState<ExternalBlob | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const createPost = useCreatePost();
  const createStory = useCreateStory();

  const handleMediaSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "post" | "story",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
      setUploadProgress(pct),
    );
    const preview = URL.createObjectURL(new Blob([bytes]));
    if (type === "post") {
      setPostMedia(blob);
      setPostMediaPreview(preview);
      setPostMediaType(file.type.startsWith("video/") ? "video" : "image");
    } else {
      setStoryImage(blob);
      setStoryImagePreview(preview);
    }
  };

  const clearMedia = (type: "post" | "story") => {
    if (type === "post") {
      setPostMedia(null);
      setPostMediaPreview("");
      setPostMediaType("image");
    } else {
      setStoryImage(null);
      setStoryImagePreview("");
    }
    setUploadProgress(0);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postMedia) {
      return;
    }
    // Build content with tags and location appended for display
    const fullContent = [
      postContent.trim(),
      postTags.trim() ? `tags:${postTags.trim()}` : "",
      postLocation.trim() ? `loc:${postLocation.trim()}` : "",
    ]
      .filter(Boolean)
      .join("|||");
    try {
      await createPost.mutateAsync({
        content: fullContent,
        image: postMedia,
      });
      setPostContent("");
      setPostTags("");
      setPostLocation("");
      setPostMedia(null);
      setPostMediaPreview("");
      setUploadProgress(0);
      onSuccess();
    } catch {}
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyContent.trim() && !storyImage) {
      return;
    }
    try {
      await createStory.mutateAsync({
        content: storyContent.trim(),
        image: storyImage,
      });
      setStoryContent("");
      setStoryImage(null);
      setStoryImagePreview("");
      setUploadProgress(0);
      onSuccess();
    } catch {}
  };

  return (
    <div data-ocid="create.page" className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-border">
        <h1 className="text-xl font-bold font-display gradient-text">Create</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <Tabs defaultValue="post">
          <TabsList data-ocid="create.tab" className="w-full bg-muted mb-4">
            <TabsTrigger
              value="post"
              data-ocid="create.post.tab"
              className="flex-1"
            >
              Post
            </TabsTrigger>
            <TabsTrigger
              value="story"
              data-ocid="create.story.tab"
              className="flex-1"
            >
              Story
            </TabsTrigger>
          </TabsList>

          {/* Post tab */}
          <TabsContent value="post">
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Caption</Label>
                <Textarea
                  data-ocid="create.textarea"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write a caption..."
                  className="bg-input border-border resize-none min-h-[100px]"
                  maxLength={500}
                />
                <span className="text-xs text-muted-foreground text-right">
                  {postContent.length}/500
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2">
                <Label>Tags</Label>
                <Input
                  data-ocid="create.input"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder="#tags (comma separated)"
                  className="bg-input border-border"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-ocid="create.input"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Add location"
                    className="bg-input border-border pl-9"
                  />
                </div>
              </div>

              {/* Media upload */}
              {postMediaPreview ? (
                <div className="relative">
                  {postMediaType === "video" ? (
                    <video
                      src={postMediaPreview}
                      controls
                      className="w-full rounded-xl max-h-64"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <img
                      src={postMediaPreview}
                      alt="Preview"
                      className="w-full rounded-xl object-cover max-h-64"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => clearMedia("post")}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 rounded-b-xl">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <label
                  data-ocid="create.upload_button"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors"
                  htmlFor="post-media-upload"
                >
                  <FileImage className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Add photo or video
                  </span>
                  <input
                    id="post-media-upload"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleMediaSelect(e, "post")}
                  />
                </label>
              )}

              <Button
                type="submit"
                data-ocid="create.post.submit_button"
                disabled={
                  createPost.isPending || (!postContent.trim() && !postMedia)
                }
                className="h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-semibold rounded-2xl"
              >
                {createPost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" /> Share Post
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Story tab */}
          <TabsContent value="story">
            <form onSubmit={handleCreateStory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Story text</Label>
                <Textarea
                  data-ocid="create.story.textarea"
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="Something quick to share..."
                  className="bg-input border-border resize-none min-h-[100px]"
                  maxLength={200}
                />
              </div>

              {storyImagePreview ? (
                <div className="relative">
                  <img
                    src={storyImagePreview}
                    alt="Preview"
                    className="w-full rounded-xl object-cover max-h-64"
                  />
                  <button
                    type="button"
                    onClick={() => clearMedia("story")}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label
                  data-ocid="create.story.upload_button"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors"
                  htmlFor="story-image-upload"
                >
                  <FileImage className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Add photo to story
                  </span>
                  <input
                    id="story-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleMediaSelect(e, "story")}
                  />
                </label>
              )}

              <Button
                type="submit"
                data-ocid="create.story.submit_button"
                disabled={
                  createStory.isPending || (!storyContent.trim() && !storyImage)
                }
                className="h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-semibold rounded-2xl"
              >
                {createStory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                  </>
                ) : (
                  "Share Story"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
