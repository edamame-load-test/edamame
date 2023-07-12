const format = {
  date(dateString) {
    const date = new Date(dateString);
    const monthDay = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    }).format(date);
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
    return `${monthDay} · ${time}`;
  },

  script(script) {
    return script.replace(/\\"/g, '"').replace(/\\n/g, "\n");
  },

  timeDifference(endTime, startTime) {
    let seconds = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);

    let hrsFormatted = hours > 0 ? 
      `${hours} hr${hours === 1 ? "" : "s"}` : 
      "";
    let minsFormatted = minutes > 0 ? 
      `${minutes} min${minutes === 1 ? "" : "s"}` 
      : ""; 
  
    if (hours > 0) {
      return `${hrsFormatted} ${minsFormatted}`;
    } else if (minutes > 0) {
      return minsFormatted; 
    } else {
      return "0 mins";
    }
  }
};

export default format;
