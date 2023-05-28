var mybatisMapper = require("../index");
mybatisMapper.createMapper(["./test/testgraveaccent.xml"]);
var assert = require("assert");

describe("Unit Tests for Grave accent", function () {
  it("1) test for Grave accent", function (done) {
    var format = { language: "sql", indent: " " };
    var param = {
      group_name: "manager",
    };
    var query = mybatisMapper.getStatement(
      "testgraveaccent",
      "findUser",
      param,
      format
    );

    console.log(query);
    assert.equal(
      query,
      `
SELECT
  *
FROM
  user
  AND \`group\` = 'manager'
`.trim()
    );
    done();
  });
});
