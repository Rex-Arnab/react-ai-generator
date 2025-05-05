"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const url = "https://openrouter.ai/api/v1/models";

const DEFAULT_MODELS = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek: DeepSeek V3 0324 (free)"
  }
];

export function SettingsDialog({
  model,
  onModelChange,
  apiKey,
  onApiKeyChange
}) {
  const [open, setOpen] = useState(false);
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [models, setModels] = useState(DEFAULT_MODELS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://openrouter.ai/api/v1/models");
        const availableModels = response.data.data
          .filter((m) => m.architecture?.output_modalities?.includes("text"))
          .map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            contextLength: m.context_length,
            promptPrice: m.pricing?.prompt
              ? (parseFloat(m.pricing.prompt) * 1000000).toFixed(2)
              : null,
            completionPrice: m.pricing?.completion
              ? (parseFloat(m.pricing.completion) * 1000000).toFixed(2)
              : null
          }));
        setModels(availableModels);
      } catch (err) {
        setError("Failed to fetch models. Using default models.");
        console.error("Error fetching models:", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchModels();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="model">AI Model</Label>
              {!useCustomKey && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground text-sm">
                      (Enable custom API key to select)
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Model selection requires a custom API key
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={!useCustomKey}>
                  {model
                    ? models.find((m) => m.id === model)?.name || "Select model"
                    : "Select model"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search models..." />
                  <CommandList className="h-[300px] overflow-y-auto">
                    {loading ? (
                      <div className="py-6 text-center text-sm">
                        <p>Loading models...</p>
                      </div>
                    ) : error ? (
                      <div className="py-6 text-center text-sm text-destructive">
                        <p>{error}</p>
                      </div>
                    ) : (
                      <CommandGroup heading="Available Models">
                        {models.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.id}
                            onSelect={() => onModelChange(m.id)}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                model === m.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{m.name}</span>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                {m.context_length && (
                                  <span>Context: {m.context_length}</span>
                                )}
                                {m.promptPrice && (
                                  <span>Prompt: ${m.promptPrice}/M</span>
                                )}
                                {m.completionPrice && (
                                  <span>
                                    Completion: ${m.completionPrice}/M
                                  </span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    <CommandEmpty>No models found.</CommandEmpty>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="use-custom-key">Use Custom API Key</Label>
            <Switch
              id="use-custom-key"
              checked={useCustomKey}
              onCheckedChange={setUseCustomKey}
            />
          </div>
          {useCustomKey && (
            <div>
              <Label htmlFor="api-key">OpenRouter API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="sk-..."
                autoComplete="off"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
