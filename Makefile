test:
	@./node_modules/.bin/mocha \
	--reporter nyan \
	--check-leaks \
	--bail

.PHONY: test
