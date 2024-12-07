const process = require('process')
const cc = require("@conventional-commits/parser");

describe("conventional commit parsing", () => {
  test("parses valid commit messages", () => {
    const validCommits = [
      "feat: add new feature",
      "fix: resolve bug #123",
      "feat(scope): add scoped feature",
      "fix!: breaking change",
      "chore: update dependencies",
      "feat(ui): add button component\n\nBREAKING CHANGE: removes old button API",
    ];

    validCommits.forEach((message) => {
      expect(() => {
        const result = cc.parser(message);
        const formatted = cc.toConventionalChangelogFormat(result);
        // Verify expected structure
        expect(formatted).toHaveProperty("type");
        expect(formatted).toHaveProperty("subject");
      }).not.toThrow();
    });
  });

  test("handles invalid commit messages", () => {
    const invalidCommits = [
      // "random commit message",
      "update: not a valid type",
      ": missing type",
      "feat missing colon after type",
    ];

    invalidCommits.forEach((message) => {
      expect(() => {
        cc.parser(message);
      }).toThrow();
    });
  });

  test("correctly parses breaking changes", () => {
    const commitWithBreaking =
      "feat!: new api\n\nBREAKING CHANGE: old api removed\n\nThis will break existing implementations.";

    const result = cc.parser(commitWithBreaking);
    const formatted = cc.toConventionalChangelogFormat(result);

    expect(formatted.type).toBe("feat");
    expect(formatted.subject).toBe("new api");
    expect(formatted.notes[0]).toEqual({
      title: "BREAKING CHANGE",
      text: "old api removed\n\nThis will break existing implementations.",
    });
  });
});

// shows how the runner will run a javascript action with env / stdout protocol
test("test run", () => {
  process.env["GITHUB_REPOSITORY"] = "__TEST_VALUE__";
  process.env["INPUT_TOKEN"] = "__TEST_VALUE__";
  process.env["INPUT_FROMTAG"] = "__TEST_VALUE__";
  process.env["INPUT_TOTAG"] = "__TEST_VALUE__";
  process.env["INPUT_WRITETOFILE"] = "false";
  process.env["INPUT_INCLUDEREFISSUES"] = "true";
  process.env["INPUT_USEGITMOJIS"] = "true";
  process.env["INPUT_INCLUDEINVALIDCOMMITS"] = "false";
  process.env["INPUT_REVERSEORDER"] = "false";

  require("./index.js");
});
