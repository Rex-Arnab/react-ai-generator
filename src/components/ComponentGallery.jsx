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
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons"; // faUpload for Load

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
      <CardHeader className="p-2">
        <CardTitle className="text-sm">Component Gallery</CardTitle>
        <CardDescription className="text-xs">Saved components</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-2">
          {components.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved components found.
            </p>
          ) : (
            <div className="space-y-3">
              {components.map((comp) => (
                <Card key={comp._id} className="shadow-sm h-64">
                  <CardHeader className="p-2">
                    <CardTitle className="text-sm">{comp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-32">
                    <ComponentPreview code={comp.code} />
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-2 border-t">
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
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
