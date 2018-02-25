test:
	@./node_modules/.bin/mocha \
	--reporter spec \
	--check-leaks \
	--bail

.PHONY: test
