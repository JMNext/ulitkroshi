const PATTERNS = [
  /[хx][уy𝄡][йӣu𝄡яеёиоа]/i,
  /п[иеё]зд/i,
  /бл[яя]д/i,
  /сук[аио]/i,
  /еб[ауоеёи]/i,
  /ёб[ауоеёи]/i,
  /муда[кц]/i,
  /гандон/i,
  /презерватив/i,
  /prezerativ/i,
  /письк[аиуео]/i,
  /жоп[аиуео]/i,
  /анус/i,
  /джигурд[аыео]/i,
  /^(ира|ira)$/i,
  /игил|isil|isis/i,
  /аль-каид[аы]/i,
  /al-qaeda/i,
  /^(эта|eta)$/i,
  /ккк|ku-klux-klan/i,
  /fuck/i,
  /bitch/i,
  /asshole/i,
  /dick/i,
  /whore/i
];

export const checkNameValidity = (text: string): "spaces" | "profane" | "song" | "ok" => {
  const t = text.trim(),
    letters = t.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, "");
  return t.includes(" ")
    ? "spaces"
    : PATTERNS.some((p) => p.test(t))
      ? "profane"
      : letters.length && (!/[aeiouyаеёиоуыэюя]/i.test(letters) || !/[bcdfghjklmnpqrstvwxzбвгджзйклмнпрстфхцчшщ]/i.test(letters))
        ? "song"
        : "ok";
};
