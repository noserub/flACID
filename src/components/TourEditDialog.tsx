import { useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEditMode, type SiteContent } from '../contexts/EditModeContext';
import { EditDialog, EditTriggerButton } from './EditableSection';
import {
  editorDestructiveGhostClass,
  editorPanelTitleClass,
  editorRowCardClass,
} from '../lib/editorStyles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type TourDateRow = SiteContent['tour']['dates'][number];

const STATUS_OPTIONS: { value: TourDateRow['status']; label: string }[] = [
  { value: 'upcoming', label: 'On sale' },
  { value: 'selling_fast', label: 'Selling fast' },
  { value: 'sold_out', label: 'Sold out' },
  { value: 'cancelled', label: 'Cancelled' },
];

function newTourDate(): TourDateRow {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `tour-${Date.now()}`;
  return {
    id,
    date: new Date().toISOString().slice(0, 10),
    venue: '',
    city: '',
    ticketUrl: '',
    status: 'upcoming',
  };
}

export function TourEditDialog() {
  const { content, updateContent } = useEditMode();
  const [title, setTitle] = useState(content.tour.title);
  const [subtitle, setSubtitle] = useState(content.tour.subtitle);
  const [footerNote, setFooterNote] = useState(content.tour.footerNote);
  const [dates, setDates] = useState<TourDateRow[]>(content.tour.dates);

  const syncFromContent = () => {
    setTitle(content.tour.title);
    setSubtitle(content.tour.subtitle);
    setFooterNote(content.tour.footerNote);
    setDates(content.tour.dates);
  };

  const handleSave = () => {
    updateContent('tour', {
      ...content.tour,
      title,
      subtitle,
      footerNote,
      dates,
    });
  };

  const updateDate = (id: string, patch: Partial<TourDateRow>) => {
    setDates((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDate = (id: string) => {
    setDates((prev) => prev.filter((d) => d.id !== id));
  };

  const addDate = () => {
    setDates((prev) => [...prev, newTourDate()]);
  };

  return (
    <EditDialog
      trigger={
        <EditTriggerButton>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit section & dates
        </EditTriggerButton>
      }
      title="Edit tour section"
      onOpenChange={(open) => {
        if (open) syncFromContent();
      }}
      onSave={handleSave}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Section title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tour Dates" />
        </div>
        <div className="space-y-2">
          <Label>Subtitle</Label>
          <Textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={2}
            placeholder="Short line under the title"
          />
        </div>
        <div className="space-y-2">
          <Label>Footer note (above mailing list)</Label>
          <Input
            value={footerNote}
            onChange={(e) => setFooterNote(e.target.value)}
            placeholder="More dates to be announced soon"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className={editorPanelTitleClass}>Tour dates</h4>
          <Button type="button" size="sm" variant="outline" onClick={addDate}>
            <Plus className="h-4 w-4 mr-2" />
            Add date
          </Button>
        </div>

        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
          {dates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No dates yet. Add one to get started.</p>
          )}
          {dates.map((row, index) => (
            <div key={row.id} className={editorRowCardClass}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Show {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={editorDestructiveGhostClass}
                  onClick={() => removeDate(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={row.date.slice(0, 10)}
                    onChange={(e) => updateDate(row.id, { date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticket status</Label>
                  <Select
                    value={row.status}
                    onValueChange={(value) =>
                      updateDate(row.id, { status: value as TourDateRow['status'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input
                  value={row.venue}
                  onChange={(e) => updateDate(row.id, { venue: e.target.value })}
                  placeholder="Venue name"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={row.city}
                  onChange={(e) => updateDate(row.id, { city: e.target.value })}
                  placeholder="City, ST"
                />
              </div>
              <div className="space-y-2">
                <Label>Ticket URL</Label>
                <Input
                  value={row.ticketUrl && row.ticketUrl !== '#' ? row.ticketUrl : ''}
                  onChange={(e) => updateDate(row.id, { ticketUrl: e.target.value.trim() })}
                  placeholder="https://…"
                />
                <p className="text-xs text-muted-foreground">Leave empty for no link (button stays disabled).</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditDialog>
  );
}
