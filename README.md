# FugsOpusMV/MZ

Use OGG OPUS files in RPG Maker MV/MZ with looping! 

RPG Maker MV and MZ both have the ability to play  the newer Opus codec for OGG audio files which have better sound at a smaller size.
The problem is the engine ​doesn't know how to read loop tog data which is important with some BGM/BGSs.

This plugin overwrites WebAudio._readOgg to find the loop tags and sample rate.

*Note: Opus files still won't preview in the editor but at least they will loop in game now!

## Install
Just move to your plugins folder and activate the plugin in your plugin manager.

No options!
