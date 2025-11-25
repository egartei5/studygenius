"use client";

import React from 'react';
import type { Settings, ResourceTypes, ImageContent, User } from '@/lib/types';
import { userService } from '@/lib/user-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onGenerate: (settings: Settings) => void;
  isLoading: boolean;
  user: User;
  onUpgradeClick: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read blob as base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, onGenerate, isLoading, user, onUpgradeClick }) => {
  const { toast } = useToast();
  const isPremium = userService.hasPremiumAccess(user);
  const MAX_FREE_ITEMS = 5;

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, topic: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File Too Large", description: "Please upload files smaller than 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings(prev => ({ ...prev, fileContent: event.target?.result as string }));
      };
      reader.readAsText(file);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Image Too Large", description: "Please upload images smaller than 5MB.", variant: "destructive" });
        return;
      }
      const base64 = await blobToBase64(file);
      const url = URL.createObjectURL(file);
      const imageContent: ImageContent = { base64, mimeType: file.type, url };
      setSettings(prev => ({...prev, imageContent}));
      handleResourceTypeChange('diagram', true);
    }
  };

  const handleResourceTypeChange = (key: string, checked: boolean | string) => {
    if (typeof checked === 'boolean') {
        setSettings(prev => ({
          ...prev,
          resourceTypes: { ...prev.resourceTypes, [key as keyof ResourceTypes]: checked }
        }));
    }
  };

  const handleCountChange = (value: number[]) => {
    const val = value[0];
    if (!isPremium && val > MAX_FREE_ITEMS) {
        onUpgradeClick();
        return;
    }
    setSettings(prev => ({ ...prev, count: val }));
  };
  
  const handleDifficultyChange = (value: string) => {
    setSettings(prev => ({ ...prev, difficulty: value as Settings['difficulty'] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(settings);
  };

  const isGenerateDisabled = isLoading || !settings.topic.trim() || !Object.values(settings.resourceTypes).some(v => v);

  return (
    <Card className="animate-fade-in shadow-2xl shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Ready to learn?</CardTitle>
        <CardDescription>What would you like to study today?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              type="text"
              id="topic"
              value={settings.topic}
              onChange={handleTopicChange}
              placeholder="e.g., World War II, Photosynthesis, Shakespearean Sonnets"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="notes">Upload Notes (optional)</Label>
              <Input type="file" id="notes" onChange={handleFileChange} accept=".txt,.md,.pdf" />
            </div>
            <div>
              <Label htmlFor="diagram">Upload a Diagram (optional)</Label>
              <Input type="file" id="diagram" onChange={handleImageChange} accept="image/*" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Study Resources to Generate</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.keys(settings.resourceTypes).map(key => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={settings.resourceTypes[key as keyof ResourceTypes]}
                    onCheckedChange={(checked) => handleResourceTypeChange(key, checked)}
                    disabled={key === 'diagram' && !settings.imageContent}
                  />
                  <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                    {key === 'mcqs' ? 'MCQs' : key.replace(/([A-Z])/g, ' $1')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="count">Items per Resource ({settings.count})</Label>
                  {!isPremium && (
                      <Button 
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={onUpgradeClick}
                          className="text-xs h-auto p-0 text-accent font-bold"
                      >
                          <Gem className="h-3 w-3 mr-1" /> Unlock Limit
                      </Button>
                  )}
              </div>
              <div className="relative">
                  <Slider
                      id="count"
                      min={1}
                      max={isPremium ? 70 : 70}
                      step={1}
                      value={[settings.count]}
                      onValueChange={handleCountChange}
                  />
                  {!isPremium && (
                      <div 
                          className="absolute top-1/2 -translate-y-1/2 h-full bg-muted/50 pointer-events-none rounded-r-full"
                          style={{ left: `${(MAX_FREE_ITEMS / 70) * 100}%`, right: 0 }}
                      ></div>
                  )}
              </div>
              {!isPremium && settings.count > MAX_FREE_ITEMS && (
                  <p className="text-xs text-muted-foreground mt-2">Upgrade to generate more than {MAX_FREE_ITEMS} items.</p>
              )}
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select onValueChange={handleDifficultyChange} defaultValue={settings.difficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Introductory">Introductory</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit"
              size="lg"
              disabled={isGenerateDisabled}
              className="w-full font-bold"
            >
              {isLoading ? 'Generating...' : 'Generate Study Set'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
