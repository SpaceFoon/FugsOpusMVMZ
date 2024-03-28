//=================================================================
//Fugahagens Opus MV Loop Tag Compatibility.
//FugsOpusMV.js version .01
//For use with RPG Maker MV 1.63
//=================================================================
//"use strict"
/*:
 * @target MV 1.63
 * @plugindesc v.01 Opus MV Loop Tag Compatibility
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
  WebAudio.prototype._readOgg = function (array) {
    var index = 0;
    while (index < array.length) {
      if (this._readFourCharacters(array, index) === "OggS") {
        index += 26;
        // console.log(index, "index");
        var vorbisHeaderFound = false;
        var numSegments = array[index++];
        // console.log("numSegments-------", numSegments);
        var segments = [];
        for (var i = 0; i < numSegments; i++) {
          segments.push(array[index++]);
        }
        // console.log("segments", segments);
        for (i = 0; i < numSegments; i++) {
          if (this._readFourCharacters(array, index + 1) === "vorb") {
            var headerType = array[index];
            // console.log("---headerType vorbis", headerType);
            if (headerType === 1) {
              this._sampleRate = this._readLittleEndian(array, index + 12);
              // console.log("_sampleRate vorbis", this._sampleRate);
            }
            if (headerType === 3) {
              this._readMetaData(array, index, segments[i]);
              // console.log("headerType 3 vorbis", headerType);
            }
            vorbisHeaderFound = true;
            // console.log("vorbisHeaderFound segments", segments, headerType);
          } else if (this._readFourCharacters(array, index) === "Opus") {
            var headerType = array[index];
            // console.log("---headerType opus", headerType, "index", index);
            if (headerType === 79) {
              if (this._sampleRate === 0) {
                this._sampleRate = this._readLittleEndian(array, index + 12);
              }
              // console.log("index in if", index);
              // console.log("_sampleRate opus", this._sampleRate);
              // console.log("segments[i]", segments[i]);
              this._readMetaData(array, index, segments[i]);
              // console.log("headerType = 79", headerType, "index:", index);
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

  // WebAudio.prototype._readMetaData = function (array, index, size) {
  //   for (var i = index; i < index + size - 10; i++) {
  //     if (this._readFourCharacters(array, i) === "LOOP") {
  //       console.log("FOUND LOOP in index", i);
  //       var text = "";
  //       while (array[i] > 0) {
  //         text += String.fromCharCode(array[i++]);
  //       }
  //       if (text.match(/LOOPSTART=([0-9]+)/)) {
  //         this._loopStart = parseInt(RegExp.$1);
  //         console.log("text=", text);
  //       }
  //       if (text.match(/LOOPLENGTH=([0-9]+)/)) {
  //         this._loopLength = parseInt(RegExp.$1);
  //         console.log("text=", text);
  //       }
  //       if (text == "LOOPSTART" || text == "LOOPLENGTH") {
  //         var text2 = "";
  //         i += 16;
  //         while (array[i] > 0) {
  //           text2 += String.fromCharCode(array[i++]);
  //           console.log("text2=", text2);
  //         }
  //         if (text == "LOOPSTART") {
  //           this._loopStart = parseInt(text2);
  //           console.log("text2=", text2);
  //         } else {
  //           this._loopLength = parseInt(text2);
  //           console.log("text2=", text2);
  //         }
  //       }
  //     }
  //   }
  // };
})();
