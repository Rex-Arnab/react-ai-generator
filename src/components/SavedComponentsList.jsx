// components/SavedComponentsList.js
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function SavedComponentsList({
  components = [],
  onLoad,
  onDelete
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2 h-4 w-4" /> Load
          Saved
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Saved Components</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {components.length === 0 && (
          <DropdownMenuItem disabled>
            No saved components found.
          </DropdownMenuItem>
        )}
        {components.map((comp) => (
          <DropdownMenuItem
            key={comp._id}
            className="flex justify-between items-center group">
            <span
              onClick={() => onLoad(comp)}
              className="cursor-pointer flex-grow mr-2">
              {comp.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive-foreground hover:bg-destructive"
              onClick={(e) => {
                e.stopPropagation(); // Prevent menu item click
                onDelete(comp._id);
              }}>
              <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
