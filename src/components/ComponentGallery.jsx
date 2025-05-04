// components/ComponentGallery.js
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
      {" "}
      {/* Make card fill height */}
      <CardHeader>
        <CardTitle>Component Gallery</CardTitle>
        <CardDescription>Load or delete saved components.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {" "}
        {/* Remove padding, ScrollArea handles it */}
        <ScrollArea className="min-h-[300px] p-4">
          {" "}
          {/* Set fixed height or use flex-grow */}
          {components.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No saved components found.
            </p>
          ) : (
            <div className="space-y-3">
              {components.map((comp) => (
                <Card key={comp._id} className="shadow-sm">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">{comp.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2 p-3 border-t">
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
