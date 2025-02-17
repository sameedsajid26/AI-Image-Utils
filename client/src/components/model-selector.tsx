import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_MODELS } from "@shared/schema";

interface ModelSelectorProps {
  type: keyof typeof SUPPORTED_MODELS;
  value: string;
  onChange: (value: string) => void;
}

export default function ModelSelector({ type, value, onChange }: ModelSelectorProps) {
  const models = SUPPORTED_MODELS[type];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
