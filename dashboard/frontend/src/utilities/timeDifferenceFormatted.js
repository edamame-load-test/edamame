function timeDifferenceFormatted(endTime, startTime) {
  let seconds = Math.floor((new Date(endTime) - new Date(startTime)) / 1000); // convert to seconds and round down
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  let hoursFormatted = hours > 0 ? `${hours}hr${hours === 1 ? "" : "s"}` : ""; // handle singular/plural
  let minutesFormatted =
    minutes > 0 ? `${minutes}min${minutes === 1 ? "" : "s"}` : ""; // handle singular/plural
  if (hours > 0) {
    return `${hoursFormatted} ${minutesFormatted}`; // include both hours and minutes
  } else if (minutes > 0) {
    return minutesFormatted; // only include minutes
  } else {
    return "0 mins"; // if below a minute
  }
}

export default timeDifferenceFormatted;
