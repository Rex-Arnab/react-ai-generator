import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MobileControls({
  prompt,
  onPromptChange,
  libraries,
  onLibrariesChange,
  componentName,
  onNameChange,
  isLoading,
  currentCode,
  selectedComponentId,
  onGenerate,
  onIterate,
  onSave,
  onFileUpload,
  filePreview,
  className = ""
}) {
  return (
    <div
      className={`mobile-left-panel hidden md:hidden p-4 border-b space-y-4 overflow-y-auto max-h-[60vh] ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe component..."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <Input
            placeholder="Libraries (optional)"
            value={libraries}
            onChange={(e) => onLibrariesChange(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Button
              onClick={onGenerate}
              disabled={isLoading}
              className="flex-1">
              {isLoading ? "Generating..." : "Generate"}
            </Button>
            <Button
              onClick={onIterate}
              disabled={isLoading || !currentCode}
              variant="outline"
              className="flex-1">
              {isLoading ? "Iterating..." : "Iterate"}
            </Button>
          </div>
          <div>
            <Label htmlFor="mobile-file-upload">Upload Image/File:</Label>
            <Input
              id="mobile-file-upload"
              type="file"
              onChange={onFileUpload}
              className="mt-1"
              disabled={isLoading}
            />
            {filePreview && (
              <div className="mt-2">
                <Label>Preview:</Label>
                <img
                  src={filePreview}
                  alt="Uploaded preview"
                  className="mt-1 max-h-32 object-contain border rounded"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Save Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Component name"
            value={componentName}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={isLoading}
          />
          <Button
            onClick={onSave}
            disabled={isLoading || !currentCode || !componentName.trim()}
            className="w-full">
            {selectedComponentId ? "Update" : "Save"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
