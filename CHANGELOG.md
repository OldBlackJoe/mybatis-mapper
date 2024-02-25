# Change Log

All notable changes to this project will be documented in this file.

# 0.8.0

* Fix match with sql-formatter's placeholder types
* Fix function scoping of findMapper & replaceCdata
* Add equalsIgnoreCase replacer

# 0.7.1

* create namespace if only not exists

# 0.7.0

* Escape param key for sql string
* Add suffix feature for TRIM
* Fix trim suffix may be empty and param may have underscore
* Solve grave accent issue

# 0.6.8

* Use escape dollar sign when using replace method

# 0.6.7

* Fix query with an apostrophe results in an error

# 0.6.6

* Update dependencies for fix issue #13

# 0.6.5

* Fix Unexpected end of input error

# 0.6.4

* Fix JSON data type parsing (arrays/objects)

# 0.6.3

* Fix bug that Null parameter was not converted.

# 0.6.2

* Hot fix for &lt;foreach&gt; element.

# 0.6.1

* Improved parameter conversion logic.
* Bug fix for &lt;trim&gt; &lt;where&gt; elements.

# 0.6.0

* Added typings for use with TypeScript.

# 0.5.3

* Hot fix for &lt;include&gt; element.

# 0.5.2

* Error Handling

# 0.5.1

* Hot fix for &lt;foreach&gt; element.

# 0.5.0

* Support &lt;include&gt; element.
* Do not formatting SQL when 'format' parameter is null
* Bug fix

# 0.4.0

* Support &lt;set&gt; element.
* Support &lt;bind&gt; element.
* SQL formatting using sql-formatter. 
* Bug fix
 
# 0.3.0

* Support CDATA section
* Bug fix & Error Handling

# 0.2.0

* Change XML parsing library xml2js to html-parse-stringify2.
* Dynamic SQL elements can be used recursively. For example: &lt;if&gt;&lt;if&gt;&lt;/if&gt;&lt;/if&gt; 
* Support &lt;choose&gt; &lt;when&gt; &lt;otherwise&gt; element.
* Support &lt;trim&gt; element.

# 0.1.0

* Initial Version