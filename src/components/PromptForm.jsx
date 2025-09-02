import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PromptForm({
  prompt,
  onPromptChange,
  libraries,
  onLibrariesChange,
  isLoading,
  currentCode,
  onGenerate,
  onIterate,
  onFileUpload,
  filePreview,
  className = ""
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Prompt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="prompt-input">Describe the component you want:</Label>
          <Textarea
            id="prompt-input"
            placeholder="e.g., A button that increments a counter on click, styled with primary colors."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="h-48 resize-none mt-1"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="libs-input">NPM Libraries / CDNs (optional):</Label>
          <Input
            id="libs-input"
            placeholder="e.g., react-icons, https://cdn.skypack.dev/canvas-confetti"
            value={libraries}
            onChange={(e) => onLibrariesChange(e.target.value)}
            className="mt-1"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="file-upload">Upload Image/File (optional):</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={onFileUpload}
            className="mt-1"
            disabled={isLoading}
          />
          {filePreview && (
            <div className="mt-2">
              <Label>File Preview:</Label>
              <img
                src={filePreview}
                alt="Uploaded preview"
                className="mt-1 max-h-40 object-contain border rounded"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
        <Button
          onClick={onIterate}
          disabled={isLoading || !currentCode || currentCode.startsWith(" //")}
          variant="outline">
          {isLoading ? "Iterating..." : "Iterate"}
        </Button>
        <Button onClick={onGenerate} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </CardFooter>
    </Card>
  );
}
