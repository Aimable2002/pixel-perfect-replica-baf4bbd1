import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Option = { value: string; label: string; example?: string };

export const voiceOptions: Option[] = [
  { value: 'Warm and friendly', label: 'Warm & friendly', example: '“We’d love to see you! Come discover what’s new this week.”' },
  { value: 'Professional and trustworthy', label: 'Professional & trustworthy', example: '“Dependable service, thoughtful advice, and results you can count on.”' },
  { value: 'Playful and energetic', label: 'Playful & energetic', example: '“Big news, good vibes. Your next favorite is here!”' },
  { value: 'Elegant and refined', label: 'Elegant & refined', example: '“Thoughtfully crafted. An experience worth savoring.”' },
  { value: 'Bold and confident', label: 'Bold & confident', example: '“Make your next move count. Stand out with something exceptional.”' },
  { value: 'Helpful and educational', label: 'Helpful & educational', example: '“Here are three simple ways to get more from your next visit.”' },
];

export const businessOptions: Option[] = [
  { value: 'Restaurant, café or food service', label: 'Restaurant, café & food' },
  { value: 'Retail or online store', label: 'Retail & online store' },
  { value: 'Beauty or personal care', label: 'Beauty & personal care' },
  { value: 'Health, fitness or wellness', label: 'Health, fitness & wellness' },
  { value: 'Professional services', label: 'Professional services' },
  { value: 'Real estate', label: 'Real estate' },
  { value: 'Travel or hospitality', label: 'Travel & hospitality' },
  { value: 'Education or coaching', label: 'Education & coaching' },
  { value: 'Events or entertainment', label: 'Events & entertainment' },
  { value: 'Technology or software', label: 'Technology & software' },
];

export function PresetField({ id, label, value, onChange, options, placeholder = 'Choose an option', numeric = false }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  numeric?: boolean;
}) {
  const [custom, setCustom] = useState(false);
  const selected = options.find(option => option.value === value);
  const isCustom = custom || (!!value && !selected);

  return <div className="min-w-0 space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Select value={isCustom ? 'custom' : value} onValueChange={next => {
      setCustom(next === 'custom');
      onChange(next === 'custom' ? '' : next);
    }}>
      <SelectTrigger id={id} className="w-full min-w-0"><SelectValue placeholder={placeholder}/></SelectTrigger>
      <SelectContent>
        {options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        <SelectItem value="custom">{numeric ? 'Custom amount' : 'Other / custom answer'}</SelectItem>
      </SelectContent>
    </Select>
    {isCustom && <Input aria-label={`Custom ${label.toLowerCase()}`} type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined} value={value} onChange={event => onChange(event.target.value)} placeholder={numeric ? 'Enter amount' : `Your ${label.toLowerCase()}`} />}
    {!isCustom && selected?.example && <p className="border-l-2 border-primary/30 pl-3 text-xs leading-relaxed text-muted-foreground">{selected.example}</p>}
  </div>;
}