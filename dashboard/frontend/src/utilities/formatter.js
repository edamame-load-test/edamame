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
  }
};

export default format;
