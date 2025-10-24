# Implementation Plan

- [x] 1. Enhance progress bar visual clarity and structure





  - Add new HTML elements for hover preview, tooltip, and drag handle to the progress bar container
  - Update CSS to add visible borders and enhanced background to `.player-progress-bar` for better visibility
  - Add `.player-progress-handle` styles with transform animations and glow effects
  - Add `.player-progress-hover` styles for the hover preview indicator
  - Add `.player-progress-tooltip` styles with positioning and fade animations
  - Apply `font-variant-numeric: tabular-nums` to `.player-time` to prevent layout shifts
  - Add `will-change` properties to progress elements for GPU acceleration
  - _Requirements: 4.1, 4.2, 4.4, 5.5_

- [x] 2. Fix time display consistency and formatting





  - [x] 2.1 Enhance the `formatTime()` function with validation


    - Add checks for NaN, Infinity, null, and undefined values
    - Return '0:00' for invalid inputs
    - Ensure proper zero-padding for seconds
    - _Requirements: 3.3, 3.4_
  - [x] 2.2 Implement throttled time updates


    - Add `lastTimeUpdate` variable to track last update timestamp
    - Add `TIME_UPDATE_INTERVAL` constant set to 100ms
    - Modify `timeupdate` event handler to throttle updates to 10 per second maximum
    - Skip updates when `isDragging` is true to prevent conflicts
    - _Requirements: 3.2, 6.2_
  - [x] 2.3 Improve duration loading and display


    - Enhance `loadedmetadata` event handler with duration validation
    - Use `isValidDuration()` helper function to check for valid duration
    - Set totalTimeEl to '0:00' when duration is invalid
    - Update totalTimeEl immediately when valid duration is available
    - _Requirements: 3.1, 3.3_

- [x] 3. Implement drag-to-seek functionality





  - [x] 3.1 Add drag state management variables


    - Add `isDragging` boolean flag initialized to false
    - Add `wasPlayingBeforeDrag` boolean to track playback state
    - Add helper function `isValidDuration(duration)` for validation checks
    - _Requirements: 2.1_
  - [x] 3.2 Implement mousedown handler for drag initiation


    - Create `handleProgressBarMouseDown(e)` function
    - Check for valid audio duration before allowing drag
    - Set `isDragging` to true and store playback state in `wasPlayingBeforeDrag`
    - Add 'dragging' class to progressFill for styling
    - Attach global mousemove and mouseup listeners
    - Call preventDefault() to prevent text selection
    - _Requirements: 2.1, 2.5_
  - [x] 3.3 Implement mousemove handler for drag updates

    - Create `handleProgressBarDrag(e)` function
    - Calculate percentage based on mouse position relative to progress bar
    - Clamp percentage between 0 and 1
    - Update progress fill width immediately without seeking audio
    - Update current time display to show preview time
    - _Requirements: 2.2, 2.3_
  - [x] 3.4 Implement mouseup handler for drag completion

    - Create `handleProgressBarMouseUp(e)` function
    - Set `isDragging` to false and remove 'dragging' class
    - Remove global mousemove and mouseup listeners
    - Calculate final seek position and update `audio.currentTime`
    - Resume playback if `wasPlayingBeforeDrag` is true
    - _Requirements: 2.4_
  - [x] 3.5 Add drag state cleanup and error handling


    - Add beforeunload listener to clean up drag state on page unload
    - Add visibilitychange listener to end drag when page becomes hidden
    - Ensure event listeners are properly removed in all cleanup scenarios
    - _Requirements: 2.5_

- [x] 4. Enhance click-to-seek functionality





  - Improve existing click handler with better validation
  - Add immediate visual feedback by calling `updateProgressUI()` before seeking
  - Update current time display immediately after click
  - Ensure click handler doesn't interfere with drag functionality
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



- [x] 5. Implement hover preview and tooltip system



  - [x] 5.1 Create hover preview functionality


    - Create `handleProgressBarMouseMove(e)` function for hover tracking
    - Calculate hover position percentage from mouse coordinates
    - Update `.player-progress-hover` width to show preview position
    - Skip hover updates when dragging or audio duration is invalid
    - _Requirements: 5.1, 5.2_
  - [x] 5.2 Implement time tooltip display

    - Calculate preview time based on hover position
    - Update tooltip text with formatted time using `formatTime()`
    - Position tooltip horizontally based on mouse X coordinate
    - Show/hide tooltip with CSS opacity transitions
    - _Requirements: 5.3_
  - [x] 5.3 Add hover state management

    - Create `handleProgressBarMouseEnter()` to show hover elements
    - Create `handleProgressBarMouseLeave()` to hide hover elements
    - Ensure hover elements only appear when audio duration is valid
    - Add smooth transitions for hover state changes
    - _Requirements: 5.1, 5.4_
-

- [x] 6. Optimize performance and animations




  - [x] 6.1 Implement requestAnimationFrame for hover updates


    - Add `hoverUpdateFrame` variable to store animation frame ID
    - Wrap hover update logic in requestAnimationFrame
    - Cancel previous frame before requesting new one to prevent queue buildup
    - _Requirements: 6.1, 6.5_
  - [x] 6.2 Add conditional transition removal during drag


    - Remove CSS transitions from progressFill when drag starts
    - Restore transitions when drag ends
    - Ensure instant visual feedback during drag operations
    - _Requirements: 6.3, 6.4_
  - [x] 6.3 Verify GPU acceleration is active


    - Confirm `will-change` properties are applied to animated elements
    - Add `transform: translateZ(0)` to force GPU layer creation
    - Test that animations maintain 60 FPS during playback
    - _Requirements: 6.1, 6.5_

- [x] 7. Add error handling and edge cases





  - Enhance audio error handler to reset progress bar UI to safe state
  - Add drag state cleanup in error handler
  - Disable seek functionality when duration is invalid by setting cursor to 'not-allowed'
  - Add validation checks before all seek operations
  - _Requirements: 1.5, 2.5, 3.3_
-

- [x] 8. Integrate all components and test




  - Wire up all event listeners to progress bar element
  - Ensure drag and click handlers work together without conflicts
  - Test seek functionality while playing and paused
  - Verify time display updates correctly in all scenarios
  - Test hover preview and tooltip positioning
  - Verify visual feedback is immediate and smooth
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_
