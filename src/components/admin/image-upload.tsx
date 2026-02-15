"use client";

import { useState } from "react";
import { X, Link2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDropzone } from "@/lib/uploadthing";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Image" }: ImageUploadProps) {
  const [urlInput, setUrlInput] = useState(value);

  return (
    <div className="space-y-2">
      <Tabs defaultValue="upload">
        <TabsList className="h-8">
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="mr-1 h-3 w-3" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs">
            <Link2 className="mr-1 h-3 w-3" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-2">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                onChange(res[0].ufsUrl);
                toast.success("Image uploaded!");
              }
            }}
            onUploadError={(error) => {
              toast.error(error.message || "Upload failed");
            }}
            className="border-2 border-dashed border-border ut-button:bg-primary ut-button:text-primary-foreground ut-label:text-muted-foreground ut-allowed-content:text-muted-foreground"
          />
        </TabsContent>

        <TabsContent value="url" className="mt-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onChange(urlInput);
                toast.success(`${label} URL set`);
              }}
            >
              Set
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {value && (
        <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={`${label} preview`}
            className="h-full w-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => {
              onChange("");
              setUrlInput("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
