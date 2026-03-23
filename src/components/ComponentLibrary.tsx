import { useState } from 'react';
import { X, Search, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';

interface ComponentLibraryProps {
  onClose: () => void;
}

interface ComponentDemo {
  category: string;
  name: string;
  description: string;
  component: React.ReactNode;
  usage: string;
}

export function ComponentLibrary({ onClose }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const components: ComponentDemo[] = [
    // Form Components
    {
      category: 'Forms',
      name: 'Button',
      description: 'Clickable button with multiple variants and sizes',
      usage: '<Button variant="default">Click me</Button>',
      component: (
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Input',
      description: 'Text input field for user data entry',
      usage: '<Input placeholder="Enter text..." />',
      component: (
        <div className="space-y-2 max-w-sm">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
          <Input type="email" placeholder="Email input" />
          <Input type="password" placeholder="Password input" />
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Label',
      description: 'Accessible label for form fields',
      usage: '<Label htmlFor="input">Label text</Label>',
      component: (
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="example">Example Label</Label>
          <Input id="example" placeholder="Associated input" />
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Textarea',
      description: 'Multi-line text input for longer content',
      usage: '<Textarea placeholder="Enter text..." />',
      component: (
        <div className="max-w-sm">
          <Textarea placeholder="Type your message here..." rows={4} />
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Select',
      description: 'Dropdown selection menu',
      usage: '<Select><SelectTrigger>...</SelectTrigger></Select>',
      component: (
        <div className="max-w-sm">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Checkbox',
      description: 'Boolean checkbox for selections',
      usage: '<Checkbox id="check" />',
      component: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="check1" />
            <Label htmlFor="check1">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check2" checked />
            <Label htmlFor="check2">Checked by default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="check3" disabled />
            <Label htmlFor="check3">Disabled checkbox</Label>
          </div>
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Radio Group',
      description: 'Single selection from multiple options',
      usage: '<RadioGroup><RadioGroupItem value="1" /></RadioGroup>',
      component: (
        <RadioGroup defaultValue="option1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="r1" />
            <Label htmlFor="r1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="r2" />
            <Label htmlFor="r2">Option 2</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option3" id="r3" />
            <Label htmlFor="r3">Option 3</Label>
          </div>
        </RadioGroup>
      ),
    },
    {
      category: 'Forms',
      name: 'Switch',
      description: 'Toggle switch for on/off states',
      usage: '<Switch />',
      component: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch id="switch1" />
            <Label htmlFor="switch1">Enable notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="switch2" checked />
            <Label htmlFor="switch2">Enabled by default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="switch3" disabled />
            <Label htmlFor="switch3">Disabled switch</Label>
          </div>
        </div>
      ),
    },
    {
      category: 'Forms',
      name: 'Slider',
      description: 'Range slider for numeric input',
      usage: '<Slider defaultValue={[50]} max={100} />',
      component: (
        <div className="space-y-4 max-w-sm">
          <div>
            <Label>Volume</Label>
            <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
          </div>
          <div>
            <Label>Range Selection</Label>
            <Slider defaultValue={[25, 75]} max={100} step={1} className="mt-2" />
          </div>
        </div>
      ),
    },

    // Display Components
    {
      category: 'Display',
      name: 'Card',
      description: 'Container for grouped content with header and footer',
      usage: '<Card><CardHeader>...</CardHeader></Card>',
      component: (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content area of the card component.</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      ),
    },
    {
      category: 'Display',
      name: 'Badge',
      description: 'Small label for status or count indicators',
      usage: '<Badge>New</Badge>',
      component: (
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      ),
    },
    {
      category: 'Display',
      name: 'Alert',
      description: 'Contextual feedback messages',
      usage: '<Alert><AlertTitle>...</AlertTitle></Alert>',
      component: (
        <div className="space-y-2">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a default alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong.</AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      category: 'Display',
      name: 'Avatar',
      description: 'User profile image with fallback',
      usage: '<Avatar><AvatarImage src="..." /></Avatar>',
      component: (
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      ),
    },
    {
      category: 'Display',
      name: 'Skeleton',
      description: 'Loading placeholder animation',
      usage: '<Skeleton className="h-4 w-full" />',
      component: (
        <div className="space-y-2 max-w-sm">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      ),
    },
    {
      category: 'Display',
      name: 'Progress',
      description: 'Progress bar indicator',
      usage: '<Progress value={60} />',
      component: (
        <div className="space-y-4 max-w-sm">
          <Progress value={33} />
          <Progress value={66} />
          <Progress value={100} />
        </div>
      ),
    },
    {
      category: 'Display',
      name: 'Separator',
      description: 'Visual divider between content',
      usage: '<Separator />',
      component: (
        <div className="space-y-4 max-w-sm">
          <div>Content above</div>
          <Separator />
          <div>Content below</div>
          <div className="flex items-center gap-4">
            <span>Left</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Right</span>
          </div>
        </div>
      ),
    },
    {
      category: 'Display',
      name: 'Table',
      description: 'Structured data table',
      usage: '<Table><TableHeader>...</TableHeader></Table>',
      component: (
        <div className="max-w-2xl">
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>INV002</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ),
    },

    // Navigation Components
    {
      category: 'Navigation',
      name: 'Tabs',
      description: 'Tabbed interface for content switching',
      usage: '<Tabs><TabsList>...</TabsList></Tabs>',
      component: (
        <Tabs defaultValue="tab1" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for Tab 1</TabsContent>
          <TabsContent value="tab2">Content for Tab 2</TabsContent>
          <TabsContent value="tab3">Content for Tab 3</TabsContent>
        </Tabs>
      ),
    },
    {
      category: 'Navigation',
      name: 'Accordion',
      description: 'Collapsible content sections',
      usage: '<Accordion><AccordionItem>...</AccordionItem></Accordion>',
      component: (
        <Accordion type="single" collapsible className="max-w-sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>
              Content for section 1 goes here.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>
              Content for section 2 goes here.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
    {
      category: 'Navigation',
      name: 'Scroll Area',
      description: 'Custom scrollable container',
      usage: '<ScrollArea className="h-[200px]">...</ScrollArea>',
      component: (
        <ScrollArea className="h-[150px] w-full max-w-sm rounded-md border p-4">
          <div className="space-y-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="text-sm">
                Scrollable item {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
  ];

  const filteredComponents = components.filter((comp) => {
    const query = searchQuery.toLowerCase();
    return (
      comp.name.toLowerCase().includes(query) ||
      comp.description.toLowerCase().includes(query) ||
      comp.category.toLowerCase().includes(query)
    );
  });

  const categories = Array.from(new Set(components.map((c) => c.category)));

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                    UI Component Library
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    All available components for Figma redesign
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {categories.map((category) => {
              const categoryComponents = filteredComponents.filter(
                (c) => c.category === category
              );

              if (categoryComponents.length === 0) return null;

              return (
                <div key={category} className="mb-12">
                  <h2 className="text-3xl mb-6 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {category}
                  </h2>
                  <div className="grid gap-6">
                    {categoryComponents.map((comp) => (
                      <Card key={comp.name} className="overflow-hidden">
                        <CardHeader className="bg-muted/30">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl mb-2">
                                {comp.name}
                              </CardTitle>
                              <CardDescription className="text-base">
                                {comp.description}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">{comp.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Component Demo */}
                            <div className="p-6 rounded-lg border border-border bg-card/50">
                              {comp.component}
                            </div>

                            {/* Usage Code */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Usage:
                              </Label>
                              <pre className="p-3 rounded-lg bg-muted/50 text-sm overflow-x-auto">
                                <code className="text-foreground">
                                  {comp.usage}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredComponents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No components found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredComponents.length} of {components.length}{' '}
              components
            </span>
            <span>{categories.length} categories</span>
          </div>
        </div>
      </div>
    </div>
  );
}
