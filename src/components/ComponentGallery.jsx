// components/ComponentGallery.js
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ComponentPreview from "@/components/ComponentPreview";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faUpload,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";

export default function ComponentGallery({
  components = [],
  onLoad,
  onDelete,
  isLoading
}) {
  if (!components) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Component Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading components...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-3">
        <CardTitle className="text-base">Component Gallery</CardTitle>
        <CardDescription className="text-sm">Saved components</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-3">
          {components.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved components f ound.
            </p>
          ) : (
            <div className="space-y-3">
              {components.map((comp) => (
                <Card key={comp._id} className="shadow-sm h-full">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{comp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-full">
                    <ComponentPreview
                      code={comp.code}
                      showDeviceControls={false}
                    />
                    <div className="flex justify-end gap-2 p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoad(comp)}
                        disabled={isLoading}
                        title="Load Component">
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="mr-1 h-3 w-3"
                        />{" "}
                        Load
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(comp._id)}
                        disabled={isLoading}
                        title="Delete Component">
                        <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/preview/${comp._id}`, "_blank")
                        }
                        disabled={isLoading}
                        title="Preview in new tab">
                        <FontAwesomeIcon
                          icon={faExternalLinkAlt}
                          className="h-3 w-3"
                        />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
