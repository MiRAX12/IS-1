package entity;

import java.util.Objects;

public class House {

    private Long id;

    private String name; //Поле не может быть null

    private Integer year; //Значение поля должно быть больше 0

    private Integer numberOfFloors; //Поле может быть null, Значение поля должно быть больше 0

    public House() {
    }

    public House(String name, Integer year, Integer numberOfFloors) {
        this.name = name;
        this.year = year;
        this.numberOfFloors = numberOfFloors;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getNumberOfFloors() {
        return numberOfFloors;
    }

    public void setNumberOfFloors(Integer numberOfFloors) {
        this.numberOfFloors = numberOfFloors;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        House house = (House) o;
        return Objects.equals(id, house.id) && Objects.equals(name, house.name) && Objects.equals(year, house.year) && Objects.equals(numberOfFloors, house.numberOfFloors);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, year, numberOfFloors);
    }

    @Override
    public String toString() {
        return "House{id=" + id + ", name='" + name + "', year=" + year
                + ", numberOfFloors=" + numberOfFloors + '}';
    }
}
