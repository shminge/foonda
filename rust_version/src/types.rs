

pub trait Entity {
    fn type_name() -> &'static str;
    fn render(&self) -> String;
}