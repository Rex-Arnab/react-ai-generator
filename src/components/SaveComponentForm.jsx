import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SaveComponentForm({
  componentName,
  onNameChange,
  isLoading,
  currentCode,
  selectedComponentId,
  onSave,
  className = ""
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Save Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="component-name">Component Name:</Label>
        <Input
          id="component-name"
          placeholder="e.g., counter-button"
          value={componentName}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSave}
          disabled={
            isLoading ||
            !currentCode ||
            currentCode.startsWith(" //") ||
            !componentName.trim()
          }
          className="w-full">
          {isLoading
            ? "Saving..."
            : selectedComponentId
            ? "Update Saved Component"
            : "Save New Component"}
        </Button>
      </CardFooter>
    </Card>
  );
}
