const extractHashtags = (content?: string): string[] => {
  if (!content) {
    return [];
  }

  const hashtags: string[] = [];
  const regex = /#([A-Za-z0-9_]+)/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const hashtag = match[1].toLowerCase();

    if (!hashtags.includes(hashtag)) {
      hashtags.push(hashtag);
    }
  }

  return hashtags;
};

export default extractHashtags;
