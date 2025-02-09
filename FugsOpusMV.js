//=================================================================
//Fugahagens Opus MV/MZ Loop Tag Compatibility.
//FugsOpusMV.js version .10
//For use with RPG Maker MV 1.63 and MZ
//=================================================================
//"use strict"
/*:
 * @target MV 1.63
 * @plugindesc v.10 Opus MV Loop Tag Compatibility
 * @author Fugahagen
 *
 * ========================================================================
 * Full Description
 * ========================================================================
 * RPG Maker MV doesn't know how to read loop data from the newer OPUS
 * standard of OGG audio files. This plugin overwrites WebAudio._readOgg to
 * find the loop tags and sample rate.
 *
 * *Note: Opus files still won't preview in the editor but at least
 * they will loop in game now!
 * =======================================================
 * Credits
 * =======================================================
 * Credit "Fugahagen" in your game if you feel like it.
 *
 * =======================================================
 * License: The MIT License
 * =======================================================
 * Copyright 2024 Fugahagen
 * This plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 * If you violate the license agreement your mother will
 * die in her sleep tonight! All protections nulled!
 */
(function () {
  if (WebAudio.prototype._readOgg) {
    // If MV
    WebAudio.prototype._readOgg = function (array) {
      var index = 0;
      while (index < array.length) {
        if (this._readFourCharacters(array, index) === "OggS") {
          index += 26;
          var vorbisHeaderFound = false;
          var numSegments = array[index++];
          var segments = [];
          for (var i = 0; i < numSegments; i++) {
            segments.push(array[index++]);
          }
          for (i = 0; i < numSegments; i++) {
            if (this._readFourCharacters(array, index + 1) === "vorb") {
              var headerType = array[index];
              if (headerType === 1) {
                this._sampleRate = this._readLittleEndian(array, index + 12);
              }
              if (headerType === 3) {
                this._readMetaData(array, index, segments[i]);
              }
              vorbisHeaderFound = true;
            } else if (this._readFourCharacters(array, index) === "Opus") {
              var headerType = array[index];
              if (headerType === 79) {
                if (this._sampleRate === 0) {
                  this._sampleRate = this._readLittleEndian(array, index + 12);
                }
                this._readMetaData(array, index, segments[i]);
              }
              vorbisHeaderFound = true;
            }
            index += segments[i];
          }
          if (!vorbisHeaderFound) {
            break;
          }
        } else {
          break;
        }
      }
    };
  } else if (WebAudio.prototype._readLoopComments) {
    WebAudio.prototype._readLoopComments = function (arrayBuffer) {
      const view = new DataView(arrayBuffer);
      let index = 0;
      while (index < view.byteLength - 30) {
        if (this._readFourCharacters(view, index) !== "OggS") {
          break;
        }
        index += 26;
        const numSegments = view.getUint8(index++);
        const segments = [];
        for (let i = 0; i < numSegments; i++) {
          segments.push(view.getUint8(index++));
        }
        const packets = [];
        while (segments.length > 0) {
          let packetSize = 0;
          while (segments[0] === 255) {
            packetSize += segments.shift();
          }
          if (segments.length > 0) {
            packetSize += segments.shift();
          }
          packets.push(packetSize);
        }
        let vorbisHeaderFound = false;
        for (const size of packets) {
          if (this._readFourCharacters(view, index) === "Opus") {
            const headerType = view.getUint8(index);
            if (headerType === 79) {
              if (this._sampleRate === 0) {
                this._sampleRate = view.getUint32(index + 12, true);
              }
            }
            this._readMetaData(view, index, size);

            vorbisHeaderFound = true;
          } else if (this._readFourCharacters(view, index + 1) === "vorb") {
            const headerType = view.getUint8(index);
            if (headerType === 1) {
              this._sampleRate = view.getUint32(index + 12, true);
            } else if (headerType === 3) {
              this._readMetaData(view, index, size);
            }
            vorbisHeaderFound = true;
          }
          index += size;
        }
        if (!vorbisHeaderFound) {
          break;
        }
      }
    };
  }
})();
