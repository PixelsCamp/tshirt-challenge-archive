#!/usr/bin/env perl

use strict;
use warnings;

use Data::Dumper;
use Getopt::Long;

my $pixel_width = 2;
my $pixel_height = 1;

my $frame_width = 39;
# my $frame_height = 40;

my $top_padding = 2;
my $left_padding = 2;
my $bottom_padding = 2;

my $bitmap_filename = "bitmap.dat";
my $code_filename = "code.js";

my $invert;

binmode(STDOUT, ":utf8");
GetOptions ("bitmap=s" => \$bitmap_filename,
            "code=s"   => \$code_filename,
            "invert"   => \$invert)
            or die("Error in command line arguments\n");

open(my $code_fh, "<:encoding(UTF-8)", $code_filename);
my $code_filesize = (stat $code_filename)[7];

open(my $bitmap_fh, "<", $bitmap_filename);
my $bytes_needed = 0;

my $positive_str = "";
my $negative_str = "";

sub gen_code_chars {
    my ($pixel) = @_;
    $pixel = $invert ? not $pixel : $pixel;
    read $code_fh, my ($output_chars), $pixel_width;
    $bytes_needed += $pixel_width;
    if ($pixel) {
        $positive_str .= $output_chars;
        $negative_str .= " " x $pixel_width;
    } else {
        $negative_str .= $output_chars;
        $positive_str .= " " x $pixel_width;
    }
}

sub gen_vertical_padding {
    my ($padding) = @_;
    for (1..$padding) {
        gen_code_chars(0) for 1..$frame_width;
        $positive_str .= "\n";
        $negative_str .= "\n";
    }
}

gen_vertical_padding($top_padding);
while (my $line = <$bitmap_fh>) {
    chomp $line;
    for (1..$pixel_height) {
        my @pixels = (map(0, 1..$left_padding), split //, $line);
        foreach my $pixel (@pixels) {
            $pixel =~ s/\s//;
            gen_code_chars($pixel);
        }
        gen_code_chars(0) for (1..($frame_width - @pixels));
        $positive_str .= "\n";
        $negative_str .= "\n";
    }
}
gen_vertical_padding($bottom_padding);


print "\n" x 2;
print $positive_str;
print "\n" x 2;
print $negative_str;
print "\n" x 2;

print "Code size: $code_filesize\n";
print "Chars needed: $bytes_needed\n";
print "Delta: ",($code_filesize - $bytes_needed),"\n";