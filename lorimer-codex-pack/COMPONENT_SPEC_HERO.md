# Component spec: Home hero

## Role

This is the emotional entry point of the site.

## Composition

The reference suggests a diptych:
- left visual field colder, quieter, more washed
- right visual field warmer and more embodied

There is also a sense of overlay and translucency that makes the hero feel less literal than a standard split screen.

## Requirements

- hero should occupy most of initial viewport
- images must be art directed through crop and position
- the center division should feel intentional
- if multiple layers are used, blending must remain subtle

## Do not

- use standard centered headline overlay
- add call to action buttons
- add marketing copy that disrupts the visual field
- animate too much

## Implementation hints

- separate image wrappers per side
- use object position carefully
- test opacity overlays only if they help recreate the reference
- ensure left side does not become muddy grey noise
- ensure right side does not become over dark
