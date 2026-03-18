# Psychedelic Visualization Documentation

This document describes each of the 10 psychedelic visualizations in the Crash Moons band website music player. All visualizations are EQ-driven, responding dynamically to 7 different frequency bands plus overall energy levels.

## Frequency Bands

All visualizations respond to these frequency bands:
- **Sub-Bass**: 20-60 Hz
- **Bass**: 60-250 Hz  
- **Low-Mid**: 250-500 Hz
- **Mid**: 500-2000 Hz
- **High-Mid**: 2000-4000 Hz
- **High**: 4000-8000 Hz
- **Presence**: 8000-16000 Hz
- **Energy**: Overall energy level (average of all bands)

## Design Principles

All visualizations share these characteristics:
- **EQ-Driven**: Audio frequency data dictates visual behavior and animation
- **Jerky/Glitchy Aesthetic**: Intentional digital glitch effects
- **Immersive**: Fill the entire container (responsive to canvas size)
- **Dark Psychedelic**: Moody backgrounds with vibrant foreground elements
- **Sophisticated**: Use of flow fields, particle systems, wave interference, and geometric patterns
- **Musical Dynamics**: Simulate realistic builds, drops, verses, and bridges

---

## Visualization 0: Organic Flow Field

### Concept
Bass-driven flow field with organic particle motion and chaotic turbulence from high frequencies.

### Visual Elements

**Particle System**
- 120-170+ particles that spawn dynamically
- Particle count increases with overall energy
- Spawn rate controlled by mid frequencies
- Size: 10-40+ pixels (bass-dependent)
- Colors: Purple/violet range (260-340 hue)
- Life-based alpha fading

**Particle Behavior**
- Flow motion driven by bass frequencies (bass/40)
- Turbulence/chaos from high frequencies (high/50)
- Sinusoidal drift based on position and time
- Wrap-around edges for continuous motion
- Radial spawning pattern from center

**Flow Field Grid**
- Dense grid coverage (20-40px cells, inversely proportional to mid frequencies)
- Vectors rotated by position + time + presence
- Line length: 20-50+ pixels (bass-dependent)
- Line width: 1.5-3.5+ pixels (energy-dependent)
- Color: Purple/magenta with value-based alpha

**Central Attractor**
- Massive pulsing central shape (80-250+ pixel radius)
- Pulses with bass and sub-bass
- 80 segments creating organic deformation
- Dual stroke layers for depth (thin inner, thick outer glow)
- Wavy edge modulation from frequency data

**Spiraling Energy Rings**
- 5 concentric rings orbiting the central attractor
- Counter-rotating (alternating direction)
- Ring radius: 120-340+ pixels
- Each ring pulses independently with frequency data
- Color shifts across purple spectrum (270-345 hue)

### EQ Response
- **Sub-Bass**: Central attractor size and glow thickness
- **Bass**: Attractor pulse, flow field strength, particle size, ring visibility
- **Low-Mid**: Attractor edge deformation
- **Mid**: Particle spawn rate, particle alpha intensity
- **High-Mid**: Particle velocity, shape detail
- **High**: Turbulence chaos, grid line length
- **Presence**: Flow field rotation speed
- **Energy**: Particle target count, overall opacity

---

## Visualization 1: Depth Layers

### Concept
Multi-layered parallax effect where each frequency band has its own depth layer with geometric shapes in the foreground.

### Visual Elements

**Frequency-Based Layers**
- 8 distinct layers, each assigned to a frequency band
- Each layer has unique color (190-330 hue spectrum)
- Layer radius: 60-410+ pixels (scaled, frequency-responsive)
- Particle count per layer: 16-72 particles
- Depth-based parallax motion (closer layers move more)

**Layer Particles**
- Size: 3-15+ pixels (increases with depth)
- Rotation: Independent per layer, alternating directions
- Alpha: Higher for foreground layers
- Dual rendering: Solid particle + radial glow
- Color: Frequency-specific hue with depth-based lightness
- Noise-based radius modulation

**Foreground Geometric Shapes**
- 12-24+ rotating shapes (controlled by high frequencies)
- Orbit distance: 180+ pixels with sinusoidal variation
- Individual rotation per shape (energy-dependent speed)
- Multi-nested rendering (3 levels per shape)
- Combined square and triangle geometry
- Size: 25-50+ pixels (value and high-mid dependent)

**Nested Shape Details**
- Each shape contains 3 nested versions
- Decreasing size progression (25%, 50%, 75%)
- Color shifts between nests (+30 hue per level)
- Line width decreases per nest level
- Both rectangles and inscribed triangles

### EQ Response
- **Sub-Bass**: Deepest layer intensity and size
- **Bass**: Second layer response, shape line width
- **Low-Mid**: Third layer modulation
- **Mid**: Fourth layer, nested shape count
- **High-Mid**: Fifth layer, shape size variation
- **High**: Sixth layer, shape count (12-24+)
- **Presence**: Seventh layer, parallax intensity (40+ pixels)
- **Energy**: Rotation speed multiplier

---

## Visualization 2: Waveform Interference

### Concept
Multiple interfering waveforms create complex patterns. Mid frequencies shape wave complexity, bass affects amplitude.

### Visual Elements

**Interference Waves**
- 10-16+ concentric waves (energy-dependent count)
- 250 points per wave for smooth curves
- Counter-rotating alternating waves
- Base radius: 120-320+ pixels (increases per wave)
- 4-layer wave interference per ring (harmonics 3, 5, 7, 9)

**Wave Characteristics**
- Wave 1: Sine with 3x frequency, 35-60+ pixel amplitude
- Wave 2: Cosine with 5x frequency, 20-35+ pixel amplitude  
- Wave 3: Sine with 7x frequency, high-mid dependent
- Wave 4: Cosine with 9x frequency, 15-30+ pixel amplitude
- Dual stroke rendering (fine line + thick glow)
- Color progression: 260-460+ hue range

**Radial Noise Pattern**
- 120-180+ radial lines (high frequency dependent)
- Lines extend from 50px to 250+ pixels
- Sinusoidal extension animation
- Gradient stroke (transparent center to peak to transparent)
- Creates spiky corona effect

**Energy Rings**
- 6-12+ pulsing concentric rings
- Radius: 60-330+ pixels
- 100 points per ring
- Phase-shifted animation
- 4-harmonic modulation per ring
- Bass-driven visibility

### EQ Response
- **Sub-Bass**: Central radial start point, ring pulse intensity
- **Bass**: Base wave radius, ring visibility, glow thickness
- **Low-Mid**: Wave 2 amplitude
- **Mid**: Wave complexity (primary control), wave stroke alpha
- **High-Mid**: Wave 3 amplitude, radial pattern alpha
- **High**: Radial point count (120-180+), wave 4 amplitude
- **Presence**: Wave rotation speed, ring phase animation
- **Energy**: Wave count (10-16+), ring count (6-12+)

---

## Visualization 3: Psychedelic Geometric (Minimal Geometric)

### Concept
Complex nested polygons responding to different frequencies, with orbiting elements and connection lines.

### Visual Elements

**Rotating Polygons**
- 7 nested polygon layers (one per frequency band)
- Sides: 3-9 (increases per layer)
- Radius: 55-440+ pixels (frequency-scaled)
- Independent rotation per layer (alternating direction)
- 3 nested versions per polygon for depth

**Polygon Nesting**
- Each polygon has 3 concentric copies
- Size reduction: 15% per nest level
- Color shifts: +20 hue per nest
- Line width decreases per nest
- Alpha fades per nest level
- Pulse animation driven by frequency data

**Orbiting Elements**
- 30-50+ orbiting particles (high frequency dependent)
- Orbit radius: 200+ pixels with bass modulation
- Individual color per orbiter (12-hue steps)
- Size: 5-25+ pixels (value and high-mid dependent)
- Radial gradient glow (3x particle size)
- Rotation speed: presence-dependent

**Connection Lines**
- Connect every other orbiter to 7th neighbor
- Creates web/constellation pattern
- Alpha: Mid-frequency controlled
- Always visible when playing
- Line width: 1-5+ pixels (mid-dependent)

**Radiating Triangles**
- 12-22+ triangles (energy-dependent)
- Emanate from center along radii
- Distance: 100+ pixels with sinusoidal variation
- Individual rotation per triangle
- Size: 15-45+ pixels (value and bass-dependent)
- Color: Warm spectrum (40-260+ hue)

### EQ Response
- **Sub-Bass**: Polygon layer 0 (triangle)
- **Bass**: Polygon layer 1 (square), triangle size, orbital wobble
- **Low-Mid**: Polygon layer 2 (pentagon)
- **Mid**: Polygon layer 3 (hexagon), connection line width/alpha
- **High-Mid**: Polygon layer 4 (heptagon), orbital particle size
- **High**: Polygon layer 5 (octagon), orbiter count (30-50+)
- **Presence**: Polygon layer 6 (nonagon), orbital rotation speed
- **Energy**: Triangle count (12-22+), rotation speed multiplier

---

## Visualization 4: Atmospheric Noise

### Concept
Sub-bass creates mass through smoky layers, high frequencies add particle detail, with a massive central vortex.

### Visual Elements

**Smoky Atmospheric Layers**
- 60-110+ large diffuse blobs (energy-dependent)
- Orbital arrangement with individual drift
- Size: 40-100+ pixels (value, bass, and low-mid dependent)
- Color: Warm earth tones (10-70 hue in 4-hue cycles)
- Low opacity (0.08-0.25) for smoky accumulation
- Three-stop radial gradients for softness

**Layer Behavior**
- Slow rotation (0.001 + presence/200 speed)
- Sinusoidal drift (40-80+ pixels bass-dependent)
- Base radius: 30-750+ pixels
- Size pulses with time and low-mid
- Multi-layer alpha blending creates depth

**Particle Dust System**
- 100-185+ small particles (high frequency dependent)
- Orbit radius: 140-800+ pixels
- Wobble motion (60-140+ pixels presence-dependent)
- Size: 1.5-5+ pixels (value and high-dependent)
- Warm color cycling (8-hue steps)
- Dual rendering: Particle + glow halo

**Central Vortex**
- Massive 12-turn logarithmic spiral
- 200 segments for smooth curve
- Radius grows to 120+ pixels at edges
- Rotation speed: Mid-frequency controlled (0.015-0.035)
- Sinusoidal edge modulation from bass
- Dual stroke layers (fine + thick glow)

**Spiral Arms**
- 5 spiral arms around vortex
- 8-turn spirals, 100 segments each
- Offset by 72° each
- Radius extends to 100+ pixels
- Color: Warm earth tones (18-50 hue)
- Counter-rotation at 70% main speed

### EQ Response
- **Sub-Bass**: Layer size and opacity, vortex radius modulation
- **Bass**: Layer drift range, vortex edge deformation, glow intensity
- **Low-Mid**: Layer size pulse amplitude
- **Mid**: Vortex rotation speed (0.015-0.035), spiral arm visibility
- **High-Mid**: Dust particle alpha, rotation speed
- **High**: Dust particle count (100-185+), particle size
- **Presence**: Dust wobble range (60-140+), layer rotation speed
- **Energy**: Layer count (60-110+), overall vortex intensity

---

## Visualization 5: Kaleidoscope Fractals

### Concept
Vibrant, colorful kaleidoscope with radial symmetry. Bass controls symmetry count, mids control fractal complexity.

### Visual Elements

**Radial Symmetry**
- 6-12+ symmetry sectors (bass-driven: floor(6 + bass/40))
- Full 360° coverage
- Each sector independently rendered then mirrored
- Extends to 70% of container width/height

**Fractal Branches**
- 8-16+ branches per sector (mid-frequency dependent)
- Each branch: 8 segments with recursive splitting
- Length: Up to 80% of max reach + bass modulation
- Angle modulation from high frequencies
- Vibrant gradient strokes per segment

**Color System**
- Full spectrum color cycling (0-360 hue)
- Hue = (time * 0.5 + segment * 30 + branch * 20 + sector * 40) % 360
- Saturation: 70-85% (high-mid controlled)
- Lightness: 50-65% (presence controlled)
- Gradient per segment (60-hue shift from start to end)

**Branch Segments**
- Each branch divided into 8 sub-segments
- Decreasing length per segment (40% reduction)
- Angular wobble from high frequencies
- Line width: 3-11+ pixels (sub-bass and depth-dependent)
- Alpha: 0.4-0.9 (value and energy-dependent)

**Central Mandala**
- 16 petal-like elements
- Radius: 50-110+ pixels (energy-pulsing)
- Slow rotation (0.003 speed)
- Individual pulse per petal from frequency data
- Size: 12-22+ pixels (mid-dependent)
- Full spectrum gradients (30-hue steps per petal)
- High saturation (90%) and lightness (65%)

### EQ Response
- **Sub-Bass**: Branch segment line width
- **Bass**: Symmetry count (6-12+), branch base length
- **Low-Mid**: Branch extension modulation
- **Mid**: Branch count per sector (8-16+), mandala petal size
- **High-Mid**: Color saturation boost, branch complexity
- **High**: Branch angle wobble intensity
- **Presence**: Color lightness boost
- **Energy**: Mandala radius, overall alpha intensity

---

## Visualization 6: Liquid Plasma

### Concept
Fluid, morphing plasma blobs with high color saturation. Creates organic, flowing metaball-like effects.

### Visual Elements

**Plasma Metaballs**
- 8-15+ large orbiting blobs (energy-dependent)
- Orbit radius: 140-280+ pixels (bass-modulated)
- Counter-rotating orbits (alternating direction)
- Blob size: 70-180+ pixels (value, bass, and pulse-dependent)
- 4-layer rendering per blob for depth

**Blob Characteristics**
- Multi-layer radial gradients (4 layers per blob)
- Size reduction: 20% per layer
- Hue rotation: 90° per layer
- Saturation: 85-95% (high frequency boosted)
- Each blob pulses independently (sine wave at 0.02 speed)
- Position influenced by low-mid frequencies

**Color Cycling**
- Full spectrum hue (0-360)
- Hue = (time * 0.4 + blob * 60 + layer * 90) % 360
- Rapid color shifts create liquid rainbow effect
- High saturation for vibrant plasma look
- Gradient per layer: 30-hue shift

**Plasma Waves**
- 6-11+ expansive concentric waves (high frequency dependent)
- 120 points per wave for smoothness
- Wave radius: 180-580+ pixels
- Dual-harmonic modulation (4x and 7x frequencies)
- Wave amplitude: 18-42+ pixels (high-mid and presence-dependent)
- Full spectrum color per wave

**Wave Interference**
- Wave 1: Sine at 4x frequency
- Wave 2: Sine at 7x frequency (counter-phase)
- Combined create organic pulsing patterns
- Stroke width: 2.5-5+ pixels (energy-dependent)
- Alpha: 0.2-0.4 (high-mid dependent)

### EQ Response
- **Sub-Bass**: (Primarily bass-driven, sub-bass has minimal direct effect)
- **Bass**: Blob orbit modulation, blob size pulse (60-180+ pixels)
- **Low-Mid**: Blob position offset
- **Mid**: Blob gradient opacity (0.3-0.8)
- **High-Mid**: Wave 1 amplitude (18-36+), wave visibility, color saturation
- **High**: Wave count (6-11+), color saturation boost
- **Presence**: Wave 2 amplitude (12-24+)
- **Energy**: Blob count (8-15+), wave stroke width

---

## Visualization 7: Neon Grid

### Concept
Cyberpunk/Tron-style perspective grid with neon colors and dynamic camera movement. Bass makes grid pulse.

### Visual Elements

**Dynamic Perspective**
- Moving vanishing point with complex sine/cosine patterns
- Camera offset: Up to 15% horizontal, 8% vertical
- Bass-driven jitter for energy
- Vanishing point: ~35% down from top
- Creates sense of flying through space

**Perspective Grid**
- 20 depth layers with quadratic depth scaling
- Horizontal lines with perspective compression
- Cell size: 30-50+ pixels (bass-dependent)
- Line width: 1-5+ pixels (depth and sub-bass-dependent)
- Alpha increases toward foreground

**Color Scheme**
- Neon cyan/magenta duality
- Hue: 180° (cyan) for front, 300° (magenta) for back
- High-mid and presence modulate hue slightly
- Saturation: 90-100% (high frequency boosted)
- Dual rendering: Fine line + thick glow (3x width)

**Vertical Grid Lines**
- 20 vertical lines converging to vanishing point
- Dynamic vanishing point creates motion
- Alpha: 0.15-0.4 (value and mid-dependent)
- Alternating cyan/magenta colors
- Creates tunnel effect

**Floating Neon Particles**
- 80-145+ particles above grid (energy-dependent)
- Orbit around vanishing point
- Multi-layer depth (6 layers, 25px apart)
- Size: 3-12+ pixels (value and high-mid-dependent)
- Full spectrum hue cycling (15-hue steps)
- Quad-size radial glow halos

**Scan Lines**
- 10-23+ horizontal scan lines (presence-dependent)
- Animated vertical scrolling (2px per frame)
- Very subtle (0.05-0.15 alpha)
- Cyan color (180° hue)
- CRT/glitch effect

### EQ Response
- **Sub-Bass**: Grid line width
- **Bass**: Grid cell size (30-50+), vanishing point jitter, vertical line hue shift
- **Low-Mid**: Particle orbit radius modulation
- **Mid**: Vertical grid alpha (0.15-0.4)
- **High-Mid**: Horizontal grid hue shift, particle size
- **High**: Scan line alpha, color saturation
- **Presence**: Grid line hue shift, scan line count (10-23+)
- **Energy**: Particle count (80-145+)

---

## Visualization 8: Spiral Galaxy

### Concept
Cosmic spiral galaxy with multiple arms, star particles, and dust clouds. Bass drives rotation.

### Visual Elements

**Spiral Arms**
- 5 distinct spiral arms
- 200 points per arm for smoothness
- 8-turn logarithmic spiral equation
- Extends to 60% of container size
- Dual stroke rendering (fine line + thick glow)

**Spiral Equation**
- Radius = t * (maxReach + bass * 0.5) + modulation
- Angle = t * 8π + time * rotation + armOffset
- Sine modulation for organic edges (2x harmonic)
- Value-based radius variation
- Each arm offset by 72° (360° / 5)

**Rotation Speed**
- Base: 0.0015 radians per frame
- Bass multiplier: 1 + bass/150
- Creates accelerating spiral during heavy sections
- All arms rotate together

**Star Particles**
- 100 stars per spiral arm (every other point)
- Size: 1.5-6+ pixels (value and high-dependent)
- Radial gradient glow (3x star size)
- Color: Cyan-green-blue spectrum (140-320 hue)
- Saturation: 70-80+ (high-mid controlled)
- Alpha: 0.7 fixed for visibility

**Central Core**
- Massive bright nucleus (50-130+ pixel radius)
- Four-stop radial gradient
- Colors: Pink → purple → violet → transparent
- High saturation (85-100%) and lightness (55-85%)
- Pulses with sub-bass and bass
- Creates bright galactic center

**Dust Clouds**
- 24-34+ nebula-like clouds (mid-dependent)
- Orbit center at 120-395+ pixel radius
- Size: 15-45+ pixels (value and energy-dependent)
- Purple color range (280-380 hue)
- Very low alpha (0.15) for atmospheric effect
- Slow rotation (0.0008 speed)

### EQ Response
- **Sub-Bass**: Core size (major), core gradient intensity
- **Bass**: Spiral arm radius, core size (minor), rotation speed, arm glow
- **Low-Mid**: Spiral edge modulation, cloud position offset
- **Mid**: Arm stroke width, dust cloud count (24-34+)
- **High-Mid**: Star saturation
- **High**: Star particle size (1.5-6+)
- **Presence**: (Minimal direct effect)
- **Energy**: Dust cloud size

---

## Visualization 9: Crystal Lattice

### Concept
Geometric crystalline structures with prismatic colors. Hexagonal lattice pattern with shifting spectrum colors.

### Visual Elements

**Hexagonal Lattice**
- Full-container coverage with extended edges
- Hexagon size: 30-45+ pixels (bass-dependent)
- Offset grid pattern (honeycomb arrangement)
- Row offset: 0.75 * hexSize horizontal
- Spacing: √3/2 * hexSize vertical

**Hexagon Properties**
- 6 sides per hexagon (naturally)
- Individual rotation per hex (based on distance from center)
- Size variation: 60-100% (distance-based) + pulse + value
- Pulse: Sine wave modulated by distance and low-mid
- Probabilistic rendering (skip some hexes based on energy)

**Distance-Based Behavior**
- Hexagons near center: Larger, brighter, rotate faster
- Hexagons at edges: Smaller, dimmer, rotate slower
- Max distance: 70% of container diagonal
- Smooth interpolation via distance ratio (distT)

**Prismatic Colors**
- Full spectrum cycling (0-360 hue)
- Hue = (time * 0.3 + distance * 2 + value/4) % 360
- Saturation: 80-90+ (high frequency boosted)
- Lightness: 50-65+ (high-mid boosted)
- Creates constantly shifting rainbow effect

**Rendering Layers**
- Fill layer: 40% alpha, main prismatic color
- Primary stroke: High intensity, main color
- Secondary stroke: Complementary color (180° hue shift), inner glow
- Line width: 1.5-6+ pixels (bass and distance-dependent)

**Prismatic Rays**
- 18-39+ rays from center (presence-dependent)
- Length: Up to 50% of max reach + high-mid modulation
- Rotating slowly (0.002 speed)
- Linear gradients from center to edge
- Hue: Full spectrum division (360° / rayCount per ray)
- Line width: 3-7+ pixels (sub-bass dependent)

### EQ Response
- **Sub-Bass**: Ray line width
- **Bass**: Hexagon base size (30-45+), stroke line width
- **Low-Mid**: Hexagon pulse amplitude
- **Mid**: Hexagon alpha intensity
- **High-Mid**: Color lightness boost, ray length extension
- **High**: Color saturation boost
- **Presence**: Ray count (18-39+)
- **Energy**: Hexagon visibility threshold (more visible = higher energy)

---

## Background System

All visualizations share a dynamic background that responds to audio:

### Background Characteristics
- Radial gradient from center
- Center point wobbles with presence frequencies (30-60+ pixels)
- Gradient radius: Half of container diagonal

### Per-Visualization Backgrounds
- Each visualization has unique base hue (15-320°)
- Saturation: 25-40% + frequency modulation
- Lightness: Three-stop gradient (bright center, mid, dark edge)
- Alpha: 0.3-0.5 (energy-dependent)

### Background Colors by Visualization
0. **Organic Flow**: Purple (270° hue), bass-modulated saturation
1. **Depth Layers**: Blue-cyan (200° hue), bass-modulated saturation  
2. **Waveform Interference**: Purple-violet (280° hue), mid-modulated saturation
3. **Psychedelic Geometric**: Orange-red (25° hue), bass-modulated saturation
4. **Atmospheric Noise**: Orange (15° hue), mid-modulated saturation
5. **Kaleidoscope Fractals**: Magenta (320° hue), energy-modulated saturation
6. **Liquid Plasma**: Cyan (180° hue), bass-modulated saturation
7. **Neon Grid**: Blue (200° hue), high-modulated saturation
8. **Spiral Galaxy**: Blue-purple (240° hue), mid-modulated saturation
9. **Crystal Lattice**: Purple-violet (290° hue), high-mid-modulated saturation

---

## Performance Optimizations

All visualizations implement:

### Canvas Optimization
- Pixel ratio limited to 1.5x max
- Desynchronized canvas context
- Intersection Observer to pause when not visible

### Request Animation Frame
- Single RAF loop per visualization
- Cleanup on component unmount
- Visibility-based pause

### Data Efficiency
- Frequency data cached per frame
- Shared EQ band calculations
- Reused gradient objects where possible

---

## Creating Prompts for New Visualizations

When creating new visualizations in this style, describe:

1. **Core Concept**: One-sentence visual metaphor (e.g., "Fluid plasma blobs with high saturation")

2. **Primary Visual Elements**: 
   - Main shapes/patterns (particles, waves, grids, etc.)
   - Element count and sizing
   - Color scheme and palette

3. **EQ Mapping**: Specify which frequency bands control which aspects:
   - Sub-Bass: Usually large-scale size/mass
   - Bass: Usually primary motion/pulse
   - Low-Mid: Secondary motion modulation
   - Mid: Complexity/density
   - High-Mid: Detail elements
   - High: Particle counts/texture
   - Presence: Rotation speed/fine detail
   - Energy: Overall intensity/element counts

4. **Motion Characteristics**:
   - Rotation directions and speeds
   - Oscillation patterns (sine, cosine)
   - Flow/drift behaviors

5. **Rendering Details**:
   - Stroke vs fill
   - Gradient types (radial, linear)
   - Layer order (background to foreground)
   - Alpha/opacity ranges

6. **Aesthetic Goals**:
   - Immersive (fills container)
   - Jerky/glitchy or smooth
   - Color temperature (warm, cool, full spectrum)
   - Density (sparse, medium, dense)

### Example Prompt Template

```
Create a psychedelic visualization called "[NAME]" with the following characteristics:

Concept: [One sentence describing the visual metaphor]

Visual Elements:
- [Element 1]: [Count range], [size range], [color scheme]
- [Element 2]: [Count range], [size range], [color scheme]
- [Element 3]: [Count range], [size range], [color scheme]

EQ Response Mapping:
- Sub-Bass: [What it controls]
- Bass: [What it controls]
- Low-Mid: [What it controls]
- Mid: [What it controls]
- High-Mid: [What it controls]
- High: [What it controls]
- Presence: [What it controls]
- Energy: [What it controls]

Motion:
- [Description of primary animation]
- [Description of secondary animation]
- [Rotation/drift characteristics]

Rendering:
- Background: [Hue], [saturation modulation]
- [Rendering technique 1]
- [Rendering technique 2]

Aesthetic:
- [Immersive/fills container]
- [Jerky/glitchy or smooth]
- [Color palette description]
- [Overall mood/feel]
```

---

## Common Techniques

### Particle Systems
```typescript
class Particle {
  x, y: position
  vx, vy: velocity
  life: current life
  maxLife: total life span
  size: render size
  hue: color
  
  update(): apply flow fields, turbulence, wrap edges
  draw(): render with gradient
  isDead(): check if life depleted
}
```

### Flow Fields
- Grid of direction vectors
- Angle calculated from position + time
- Particles follow vector field
- Turbulence = random perturbation

### Radial Gradients
```typescript
createRadialGradient(cx, cy, r0, cx, cy, r1)
addColorStop(0, bright_center)
addColorStop(1, transparent_edge)
```

### Polygon Drawing
```typescript
for (let i = 0; i < sides; i++) {
  angle = (i / sides) * Math.PI * 2
  x = centerX + Math.cos(angle) * radius
  y = centerY + Math.sin(angle) * radius
  if (i === 0) moveTo(x, y)
  else lineTo(x, y)
}
closePath()
```

### Spiral Equations
```typescript
// Logarithmic spiral
r = t * maxRadius
angle = t * turns * Math.PI * 2 + rotation

// Archimedean spiral  
r = a + b * angle
```

### Wave Interference
```typescript
wave1 = sin(angle * freq1 + time * speed1) * amp1
wave2 = cos(angle * freq2 - time * speed2) * amp2
wave3 = sin(angle * freq3 + time * speed3) * amp3
totalWave = wave1 + wave2 + wave3
```

---

## Color Theory

### Hue Ranges
- **0-60**: Warm (red, orange, yellow)
- **60-180**: Cool (yellow-green, green, cyan)
- **180-270**: Cold (cyan, blue, purple)
- **270-360**: Warm (purple, magenta, red)

### Saturation Guidelines
- **0-30%**: Muted, atmospheric, backgrounds
- **30-60%**: Moderate, balanced
- **60-80%**: Vibrant, energetic
- **80-100%**: Neon, intense, foreground

### Lightness Guidelines
- **0-20%**: Deep shadows, backgrounds
- **20-40%**: Dark elements, depth
- **40-60%**: Mid-tones, balanced
- **60-80%**: Bright elements, highlights
- **80-100%**: Glows, cores, intense highlights

---

## Glitch/Jerky Aesthetic

To create the glitchy aesthetic, visualizations use:

1. **Random Perturbation**: Add `Math.random()` to positions, sizes, alphas
2. **Discrete Steps**: Use `Math.floor()` on continuous values
3. **Turbulence**: Random velocity changes in particle systems
4. **Value-Based Jitter**: Use raw frequency data (0-255) for instantaneous response
5. **Intentional Aliasing**: Limited pixel ratio (1.5x max)
6. **Sharp Transitions**: Avoid smooth interpolation where appropriate

---

## Summary

These 10 visualizations create a comprehensive psychedelic visual experience:

1. **Organic Flow** - Flowing particles and fields
2. **Depth Layers** - Layered parallax depth
3. **Waveform Interference** - Complex wave patterns
4. **Psychedelic Geometric** - Nested polygons
5. **Atmospheric Noise** - Smoky vortex
6. **Kaleidoscope Fractals** - Radial symmetry, vibrant colors
7. **Liquid Plasma** - Fluid metaballs, rainbow colors
8. **Neon Grid** - Cyberpunk perspective grid
9. **Spiral Galaxy** - Cosmic spirals and stars
10. **Crystal Lattice** - Prismatic hexagonal grid

Each visualization responds uniquely to the 7 frequency bands, creating a dynamic, audio-reactive experience that enhances the heavy rock/post-metal aesthetic of the Crash Moons band website.